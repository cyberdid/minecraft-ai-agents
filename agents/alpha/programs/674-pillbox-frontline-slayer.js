// programs/674-pillbox-frontline-slayer.js
console.log('=== Program 674: Frontline Blaze Slayer ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Equip shield and sword
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
}
console.log('Offhand:', bot.inventory.slots[45]?.name, 'Held:', bot.heldItem?.name, 'Cobble:', lib.count('cobblestone'));

// 2. Ensure solid battlement at (35, 66, -187)
const parapet = bot.blockAt(new Vec3(35, 66, -187));
if (parapet && parapet.name === 'air' && lib.count('cobblestone') > 0) {
  console.log('Placing solid battlement at (35, 66, -187)...');
  try {
    await lib.place('cobblestone', 35, 66, -187);
    console.log('Battlement placed!');
  } catch (e) {
    console.log('Battlement placement:', e.message);
  }
}

// 3. Step forward into frontline firing slit stance at (35.9, 66.0, -187.2)
console.log('Stepping to frontline firing slit (35.9, 66.0, -187.2)...');
const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

try {
  await bot.pathfinder.goto(new goals.GoalNear(35.9, 66.0, -187.2, 0.3));
} catch (e) {
  try {
    await bot.lookAt(new Vec3(35.9, 66.0, -187.2), true);
    bot.setControlState('forward', true);
    await sleep(400);
    bot.setControlState('forward', false);
  } catch (e2) {}
}

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

bot.chat(`alpha: Locked in frontline firing slit (${lib.fmt(bot.entity.position)}) with Active Shield! Harvesting Blaze Rods! Rods: ${lib.count('blaze_rod')}`);

// 4. Combat Loop
const durationMs = 200000;
const start = Date.now();
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let hits = 0;
let kills = 0;

// Raise shield immediately facing spawner
bot.activateItem(true);
await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);

while (!checkCancelled() && Date.now() - start < durationMs && bot.game.dimension === 'the_nether') {
  if (bot.health <= 5) {
    console.log(`HP low (${bot.health.toFixed(1)}), holding stationary shield defense...`);
    bot.activateItem(true);
    await sleep(1000);
    continue;
  }

  // Find nearest valid Blaze
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    // Face Blaze to block fireballs
    await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);

    // Strike if within 4.5m
    if (dist <= 4.5 && Date.now() - lastAttack > 625) {
      bot.deactivateItem(); // Lower shield for swing
      try { await lib.equipWeapon(); } catch (e) {}
      bot.attack(target);
      lastAttack = Date.now();
      hits++;
      bot.activateItem(true); // Re-raise shield immediately!
      console.log(`Hit Blaze at ${dist.toFixed(1)}m (Hit #${hits})`);
      if (target.health !== undefined && target.health <= 0) {
        kills++;
        console.log(`+++ Blaze Slain! Total Kills: ${kills} +++`);
        bot.chat(`alpha: Blaze slain! Total kills: ${kills}!`);
      }
    } else {
      bot.activateItem(true); // Keep shield raised
    }
  } else {
    // Face spawner with shield raised
    await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
    bot.activateItem(true);
  }

  // Vacuum drops behind battlement (never step west of x=35.5)
  const items = Object.values(bot.entities).filter(e =>
    e.name === 'item' &&
    bot.entity.position.distanceTo(e.position) <= 3.0 &&
    e.position.x >= 35.5 &&
    e.position.z <= -185.0
  );
  for (const item of items) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(item.position.x, item.position.y, item.position.z, 0.4));
    } catch (e) {}
  }

  // Also try lib.pickup passively
  if (Math.random() < 0.15 && bot.entity.position.x >= 35.5) {
    try { await lib.pickup(2.0); } catch (e) {}
  }

  const curRods = lib.count('blaze_rod');
  if (curRods > lastRods) {
    console.log(`*** BLAZE ROD HARVESTED! Total: ${curRods} ***`);
    bot.chat(`alpha: Harvested Blaze Rod! Alpha holds ${curRods} Blaze Rods!`);
    lastRods = curRods;
  }

  // If Alpha has 4+ (combined with Beta's 4 = 8+) or Alpha has 8+
  if (curRods >= 4) {
    bot.chat(`alpha: Milestone 8 Target Reached! Alpha holds ${curRods} Blaze Rods! Total team has 8+!`);
    break;
  }

  await sleep(100);
}

bot.deactivateItem();
const totalRods = lib.count('blaze_rod');
console.log(`Combat round complete. Hits: ${hits}, Kills: ${kills}, Rods: ${totalRods}, HP: ${bot.health}`);
bot.chat(`alpha: Combat session complete. Hits: ${hits}, Kills: ${kills}, Rods: ${totalRods}, HP: ${bot.health.toFixed(1)}`);

// 5. If we have rods, retreat to Base and deposit
if (totalRods >= 4) {
  bot.chat('alpha: Retreating to Overworld Base with Blaze Rods!');
  console.log('Retreating to Overworld Base...');
  await globalThis.retreatToOverworldBase();
  if (bot.game.dimension === 'overworld') {
    try {
      await lib.deposit({ blaze_rod: 'all' }, 293, 72, -57);
      bot.chat('alpha: Blaze Rods safely deposited in base chest! Milestone 8 COMPLETE!');
    } catch (e) {}
  }
}

console.log('=== Program 674 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Rods:', lib.count('blaze_rod'));
