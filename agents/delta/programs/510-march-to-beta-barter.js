// programs/510-march-to-beta-barter.js
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('=== DELTA MARCH TO BETA & PIGLIN BARTER ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);
console.log(`Gold ingots held: ${lib.count('gold_ingot')}, Ender Pearls held: ${lib.count('ender_pearl')}`);

bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

// Ensure offhand shield and weapon
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
  await lib.equipWeapon();
} catch (e) {
  console.log('Equip warning:', e.message);
}

// Movements configuration
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = true; // allow digging minor obstruction if needed
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

// Determine starting waypoint
let startIdx = 0;
for (let i = 0; i < globalThis.NETHER_PILLBOX_WAYPOINTS.length; i++) {
  const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
  if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 4.0) {
    startIdx = i + 1;
  }
}
if (startIdx >= globalThis.NETHER_PILLBOX_WAYPOINTS.length) {
  startIdx = 5; // default to WP 5 if beyond
}

console.log(`Marching from WP ${startIdx}/${globalThis.NETHER_PILLBOX_WAYPOINTS.length}...`);

bot.chat(`delta: Marching along East Ridge to join Beta for Milestone 9 Piglin bartering! Holds ${lib.count('gold_ingot')} gold ingots.`);

let goldTossedToBeta = false;
let pearlsHarvested = lib.count('ender_pearl');

for (let i = startIdx; i < globalThis.NETHER_PILLBOX_WAYPOINTS.length && !checkCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  console.log(`--> Moving to WP ${i + 1}: (${wp.x}, ${wp.y}, ${wp.z})...`);

  // Clear fire ahead
  try { await globalThis.clearFireAhead(); } catch (e) {}

  // Gaze pitched low to prevent Enderman aggro
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  // Shield: deactivate during movement so we can jump up 1-block steps
  bot.deactivateItem();
  bot.setControlState('sneak', false);

  // If past z=-165 (spawner area): sneak with shield
  if (wp.z <= -165) {
    bot.setControlState('sneak', true);
    bot.activateItem(true);
  }

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (err) {
    console.log(`GoalNear at WP ${i + 1} failed: ${err.message}. Retrying with clearFire...`);
    try {
      await globalThis.clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
    } catch (err2) {
      console.log(`Retry WP ${i + 1} failed: ${err2.message}`);
    }
  }

  // Vacuum nearby items
  try { await lib.pickup(3.5); } catch (e) {}

  // Check for Beta nearby
  const beta = bot.players['beta'];
  if (beta && beta.entity) {
    const dist = bot.entity.position.distanceTo(beta.entity.position);
    console.log(`Beta spotted at ${lib.fmt(beta.entity.position)} (dist: ${dist.toFixed(1)}m)!`);

    // If close enough and have gold ingot, toss to Beta!
    if (dist <= 6.0 && lib.count('gold_ingot') > 0 && !goldTossedToBeta) {
      console.log(`Tossing gold_ingot to Beta (wearing golden_boots)...`);
      await bot.lookAt(beta.entity.position.offset(0, 1.2, 0), true);
      const ingot = bot.inventory.items().find(it => it.name === 'gold_ingot');
      if (ingot) {
        await bot.toss(ingot.type, null, ingot.count);
        goldTossedToBeta = true;
        bot.chat('delta: Tossed gold ingot to Beta for Piglin bartering!');
        console.log('Tossed gold ingot to Beta!');
      }
    }
  }

  // Check for dropped Ender Pearls nearby
  const droppedPearls = Object.values(bot.entities).filter(e =>
    e.name === 'item' &&
    bot.entity.position.distanceTo(e.position) <= 6.0
  );
  if (droppedPearls.length > 0) {
    console.log(`Found ${droppedPearls.length} dropped items nearby, vacuuming...`);
    for (const item of droppedPearls) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(item.position.x, item.position.y, item.position.z, 0.5));
      } catch (e) {}
    }
  }

  const currentPearls = lib.count('ender_pearl');
  if (currentPearls > pearlsHarvested) {
    pearlsHarvested = currentPearls;
    bot.chat(`delta: Acquired Ender Pearl! Delta holds ${pearlsHarvested}/12 pearls!`);
  }

  // Check HP
  if (bot.health <= 8) {
    console.log(`Delta HP low (${bot.health}), pausing in safe cover!`);
    bot.activateItem(true);
    break;
  }
}

// Final check at destination
bot.deactivateItem();
bot.setControlState('sneak', false);

console.log('=== MARCH COMPLETE ===');
console.log(`Final pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);
console.log(`Ender Pearls: ${lib.count('ender_pearl')}/12, Gold Ingots: ${lib.count('gold_ingot')}`);
console.log(`Inventory:`, lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls: lib.count('ender_pearl'),
  gold: lib.count('gold_ingot'),
  inv: lib.inv()
};
