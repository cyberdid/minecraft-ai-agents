// programs/673-march-and-slay-blazes.js
console.log('=== Program 673: Alpha Nether March & Blaze Slayer ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Equip shield in offhand and sword in main hand
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
}
console.log('Offhand:', bot.inventory.slots[45]?.name, 'Held:', bot.heldItem?.name, 'Cobble:', lib.count('cobblestone'));

// 2. Clear fire helper
const clearFireAhead = async function () {
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 4.5,
    count: 5
  });
  for (const fp of fires) {
    try {
      const b = bot.blockAt(fp);
      if (b) await bot.dig(b, true);
    } catch (e) {}
  }
};

// 3. Configure movements to avoid fire and lava
const moves = new Movements(bot, mcData);
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) moves.blocksToAvoid.add(id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

// 4. Safe Waypoints to Pillbox
const WAYPOINTS = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 66, z: -35 },
  { x: 62, y: 67, z: -50 },
  { x: 61.5, y: 67, z: -55 },
  { x: 61.5, y: 67, z: -60 },
  { x: 61.5, y: 67, z: -65 },
  { x: 61.5, y: 67, z: -70 },
  { x: 61.5, y: 67, z: -75 },
  { x: 62.0, y: 67, z: -80 },
  { x: 61, y: 66, z: -100 },
  { x: 50, y: 65, z: -115 },
  { x: 44, y: 65, z: -127 }, // Bunker
  { x: 44, y: 65, z: -145 }, // Covered tunnel
  { x: 44, y: 65, z: -160 },
  { x: 44, y: 65, z: -169 }, // Blast wall
  { x: 38, y: 65, z: -176 }, // Cross bridge
  { x: 36.5, y: 66, z: -187 } // Pillbox
];

let startIdx = 0;
for (let i = 0; i < WAYPOINTS.length; i++) {
  const wp = WAYPOINTS[i];
  if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 3.5) {
    startIdx = i + 1;
  }
}

bot.chat(`alpha: In Nether with Shield! Marching to Spawner Pillbox (36.5, 66, -187) from WP ${startIdx}...`);
console.log(`Marching from WP ${startIdx}/${WAYPOINTS.length} to Spawner Pillbox...`);

for (let i = startIdx; i < WAYPOINTS.length && !checkCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  await clearFireAhead();

  const wp = WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  // Past z=-165: sneak + shield up facing forward
  if (wp.z <= -165) {
    bot.setControlState('sneak', true);
    bot.activateItem(true);
  } else {
    bot.setControlState('sneak', false);
    bot.deactivateItem();
  }

  // Pitch gaze low to avoid Enderman aggro
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
    } catch (e2) {}
  }

  await clearFireAhead();
  try { await lib.pickup(3.0); } catch (e) {}

  if (bot.health <= 7) {
    console.log(`HP low (${bot.health}) during march at WP ${i + 1}, stopping in cover.`);
    break;
  }
}

bot.setControlState('sneak', false);
bot.deactivateItem();
console.log('Arrived at Spawner area! Current pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 5. Active Shield Combat Loop at Pillbox
if (bot.game.dimension === 'the_nether' && bot.health > 7) {
  // Settle at Pillbox
  try {
    await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -187.0, 0.5));
  } catch (e) {}

  bot.pathfinder.stop();
  bot.clearControlStates();

  bot.chat(`alpha: Locked inside Spawner Pillbox (${lib.fmt(bot.entity.position)}) with Active Shield! Slaying Blazes for Milestone 8! Rods: ${lib.count('blaze_rod')}/8`);

  const farmDurationMs = 180000;
  const start = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let hits = 0;
  let killed = 0;

  // Active shield raised by default facing spawner (32, 68, -190)
  bot.activateItem(true);
  await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);

  while (!checkCancelled() && Date.now() - start < farmDurationMs && bot.game.dimension === 'the_nether') {
    if (bot.health <= 6) {
      console.log(`HP low (${bot.health.toFixed(1)}), holding stationary shield defense...`);
      bot.activateItem(true);
      await sleep(1000);
      continue;
    }
    if (bot.food < 16) {
      try { await lib.eat(); } catch (e) {}
    }

    // Keep locked inside pillbox
    if (bot.entity.position.distanceTo(new Vec3(36.5, 66.0, -187.0)) > 1.2) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -187.0, 0.4));
      } catch (e) {}
    }

    const blazes = Object.values(bot.entities)
      .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
      .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

    const target = blazes[0];
    if (target) {
      const dist = bot.entity.position.distanceTo(target.position);
      // Face target to block fireballs with shield
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);

      // Melee attack if within 4.5m
      if (dist <= 4.5 && Date.now() - lastAttack > 650) {
        bot.deactivateItem(); // Lower shield for 1 swing
        try { await lib.equipWeapon(); } catch (e) {}
        bot.attack(target);
        lastAttack = Date.now();
        hits++;
        bot.activateItem(true); // Re-raise shield immediately!
        console.log(`Hit Blaze at ${dist.toFixed(1)}m (Hit #${hits})`);
        if (target.health !== undefined && target.health <= 0) {
          killed++;
          console.log(`Blaze slain! Kills: ${killed}`);
        }
      } else {
        bot.activateItem(true); // Keep shield raised
      }
    } else {
      // Face spawner with shield raised
      await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
      bot.activateItem(true);
    }

    // Safe vacuum inside pillbox
    const safeItems = Object.values(bot.entities).filter(e =>
      e.name === 'item' &&
      bot.entity.position.distanceTo(e.position) <= 2.5 &&
      e.position.x >= 35.5 &&
      e.position.z <= -185.0
    );
    for (const item of safeItems) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(item.position.x, item.position.y, item.position.z, 0.4));
      } catch (e) {}
    }

    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      console.log(`*** BLAZE ROD HARVESTED! Total: ${curRods}/8 ***`);
      bot.chat(`alpha: Blaze Rod harvested! Total: ${curRods}/8!`);
      lastRods = curRods;
    }

    if (curRods >= 8) {
      bot.chat(`alpha: MILESTONE 8 COMPLETE! ${curRods} Blaze Rods secured!`);
      break;
    }

    await sleep(100);
  }

  bot.deactivateItem();
  const totalRods = lib.count('blaze_rod');
  console.log(`Combat cycle complete. Hits: ${hits}, Kills: ${killed}, Rods: ${totalRods}/8, HP: ${bot.health}`);
  bot.chat(`alpha: Combat round finished. Hits: ${hits}, Kills: ${killed}, Rods: ${totalRods}/8, HP: ${bot.health.toFixed(1)}`);

  // 6. If target reached, retreat and deposit
  if (totalRods >= 8) {
    bot.chat('alpha: 8+ Blaze Rods in hand! Retreating to Overworld Base.');
    await globalThis.retreatToOverworldBase();
    if (bot.game.dimension === 'overworld') {
      try {
        await lib.deposit({ blaze_rod: 'all' }, 293, 72, -57);
        bot.chat('alpha: Deposited 8+ Blaze Rods in base chest! Milestone 8 100% COMPLETE!');
      } catch (e) {}
    }
  }
}

console.log('=== Program 673 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Rods:', lib.count('blaze_rod'));
