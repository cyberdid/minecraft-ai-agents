// programs/663-pillbox-blaze-harvest.js
console.log('=== Program 663: Alpha Pillbox Blaze Harvest ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Ensure door exit from base if inside
if (bot.game.dimension === 'overworld' && bot.entity.position.z < -54.2) {
  console.log('Inside base, exiting through door at (294, 72, -54)...');
  try {
    await lib.goThroughDoor(294, 72, -54);
    await sleep(500);
  } catch (e) {
    console.log('goThroughDoor note:', e.message);
  }
}

// 1. Regear
await globalThis.quickRegear({ cobble: 16 });
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Ensure shield is in offhand slot 45
const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) {
    await bot.equip(shield, 'off-hand');
    console.log('Equipped shield to off-hand.');
  }
}
console.log('Gear check -> Offhand:', bot.inventory.slots[45]?.name, 'Held:', bot.heldItem?.name, 'Cobble:', lib.count('cobblestone'));

// Update marchToSpawnerPillbox on globalThis with shield raising & sneak past z=-165
globalThis.marchToSpawnerPillbox = async function() {
  if (bot.game.dimension === 'overworld') {
    console.log('Entering Nether Portal...');
    await globalThis.enterNetherPortal();
  }
  if (bot.game.dimension !== 'the_nether') {
    throw new Error('Not in the_nether after enterNetherPortal');
  }
  globalThis.configureFireAvoidance();
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  bot.chat('alpha: In Nether with Shield! Marching safe covered route to Spawner Pillbox (36.5, 66, -187)...');

  for (let i = 0; i < globalThis.NETHER_PILLBOX_WAYPOINTS.length && !isCancelled(); i++) {
    const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
    const v = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(v) < 2.5) continue;

    // Past z = -165, bridge is narrow and Blazes have line of sight -> hold sneak and shield
    if (wp.z <= -165) {
      bot.setControlState('sneak', true);
      bot.activateItem(true);
    } else {
      bot.setControlState('sneak', false);
      bot.deactivateItem();
    }

    try {
      await lib.goTo(wp.x, wp.y, wp.z, 1.5, { dig: false, timeoutMs: 12000 });
    } catch (e) {
      try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 6000 }); } catch (e2) {}
    }
    try { await lib.pickup(3.0); } catch (e) {}
    if (bot.health <= 7) {
      console.log(`Health low (${bot.health}) during march at WP ${i + 1}, stopping in cover.`);
      break;
    }
  }
  bot.setControlState('sneak', false);
  bot.deactivateItem();
  return { dimension: bot.game.dimension, pos: bot.entity.position, hp: bot.health, rods: lib.count('blaze_rod') };
};

// Update farmBlazeRodsAtPillbox on globalThis with active shield blocking
globalThis.farmBlazeRodsAtPillbox = async function(targetRods = 8, durationMs = 120000) {
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  // Fortify parapet at (35, 66, -187) if air
  const parapetBlock = bot.blockAt(new Vec3(35, 66, -187));
  if (parapetBlock && parapetBlock.name === 'air' && lib.count('cobblestone') > 0) {
    console.log('Placing solid cobblestone battlement at (35, 66, -187)...');
    try {
      await lib.place('cobblestone', 35, 66, -187);
      console.log('Battlement placed!');
    } catch (err) {
      console.log('Battlement placement note:', err.message);
    }
  }

  // Step right up to firing slit
  try {
    await bot.pathfinder.goto(new goals.GoalNear(35.9, 66.0, -187.2, 0.3));
  } catch (e) {}
  bot.pathfinder.stop();
  bot.clearControlStates();

  bot.chat(`alpha: Locked at Spawner Pillbox firing slit (${lib.fmt(bot.entity.position)}) with Active Shield! Harvesting Blaze Rods! Rods: ${lib.count('blaze_rod')}/${targetRods}`);

  const start = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let killed = 0;
  let hits = 0;

  // Active shield raised by default facing spawner at (32, 68, -190)
  bot.activateItem(true);
  await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);

  while (!isCancelled() && Date.now() - start < durationMs) {
    if (bot.game.dimension === 'overworld') break;

    if (bot.health <= 7) {
      bot.deactivateItem();
      console.log(`HP low (${bot.health.toFixed(1)}), retreating to covered tunnel at (44, 65, -169)!`);
      bot.chat(`alpha: Low HP (${bot.health.toFixed(1)}), taking cover in tunnel!`);
      try { await lib.goTo(44, 65, -169, 1.5, { dig: false, timeoutMs: 6000 }); } catch (e) {}
      break;
    }
    if (bot.food < 16) {
      try { await lib.eat(); } catch (e) {}
    }

    const blazes = Object.values(bot.entities)
      .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
      .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

    const target = blazes[0];
    if (target) {
      const dist = bot.entity.position.distanceTo(target.position);
      // Face Blaze directly to block fireballs with shield
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);

      if (dist <= 4.8 && Date.now() - lastAttack > 625) {
        bot.deactivateItem(); // Lower shield for swing
        try { await lib.equipWeapon(); } catch (e) {}
        bot.attack(target);
        lastAttack = Date.now();
        hits++;
        console.log(`Hit Blaze at ${dist.toFixed(1)}m (Hit #${hits})`);
        if (target.health !== undefined && target.health <= 0) {
          killed++;
          console.log(`Killed Blaze! Total kills: ${killed}`);
        }
        bot.activateItem(true); // Raise shield immediately
      } else {
        bot.activateItem(true); // Keep shield raised
      }
    } else {
      await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
      bot.activateItem(true);
    }

    // Safe stationary pickup
    if (bot.entity.position.x >= 35.5 && Math.random() < 0.2) {
      try { await lib.pickup(2.5); } catch (e) {}
    }

    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      console.log(`*** BLAZE ROD HARVESTED! Total: ${curRods}/${targetRods} ***`);
      bot.chat(`alpha: Blaze Rod harvested! Total: ${curRods}/${targetRods}!`);
      lastRods = curRods;
    }

    if (curRods >= targetRods) {
      bot.chat(`alpha: MILESTONE 8 COMPLETE! We have ${curRods} Blaze Rods!`);
      break;
    }

    await sleep(90);
  }

  bot.deactivateItem();
  try { if (bot.entity.position.x >= 35.5) await lib.pickup(2.5); } catch (e) {}
  return { killed, hits, rods: lib.count('blaze_rod'), hp: bot.health, pos: bot.entity.position };
};

// 2. March to Pillbox
console.log('Starting march to Spawner Pillbox...');
const marchRes = await globalThis.marchToSpawnerPillbox();
console.log('March completed:', marchRes);

// 3. Farm Blaze Rods
if (bot.game.dimension === 'the_nether' && bot.health > 7) {
  console.log('Starting Blaze farming cycle...');
  const farmRes = await globalThis.farmBlazeRodsAtPillbox(8, 120000);
  console.log('Farm results:', farmRes);

  if (lib.count('blaze_rod') >= 8) {
    bot.chat('alpha: 8+ Blaze Rods secured! Retreating to Overworld base.');
    console.log('Retreating to Overworld Base...');
    await globalThis.retreatToOverworldBase();
    if (bot.game.dimension === 'overworld') {
      try {
        await lib.deposit({ blaze_rod: 'all' }, 293, 72, -57);
        bot.chat('alpha: Blaze Rods safely deposited in base chest (293, 72, -57)!');
      } catch (e) {}
    }
  }
}

console.log('=== Program 663 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Rods:', lib.count('blaze_rod'));
