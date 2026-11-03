// programs/729-sprint-base-lock-spawn-and-enter-nether.js
console.log('=== Program 729: Sprint to Base, Lock Spawn & Enter Nether ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Equip iron sword and ensure offhand shield
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

try {
  const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
  if (sw) await bot.equip(sw, 'hand');
  else await lib.equipWeapon();
} catch (e) {}

// 2. Sprint East across plains to base door at (294, 72, -54)
console.log('Sprinting East to base door (294, 72, -53)...');
bot.chat('alpha: Respawned at spawn; sprinting back to Base (293, 72, -55) to lock spawn and enter Nether!');

try {
  await lib.goToXZ(294, -53, { timeoutMs: 25000 });
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1.5));
  } catch (e2) {}
}

console.log('Near base door at:', lib.fmt(bot.entity.position));

// 3. Enter base door
if (bot.entity.position.z > -54.2) {
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    try {
      const door = bot.blockAt(new Vec3(294, 72, -54));
      if (door) await bot.activateBlock(door);
      bot.setControlState('forward', true);
      await sleep(600);
      bot.setControlState('forward', false);
    } catch (e2) {}
  }
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 4. Set spawn at bed
try {
  await lib.setSpawn();
  console.log('Spawn successfully set at base bed!');
  bot.chat('alpha: Spawn point permanently set at Base Bed (294, 72, -55)!');
} catch (e) {
  console.log('setSpawn error:', e.message);
}

// 5. Enter Nether portal using 1-line helper
console.log('Entering Nether Portal at (299.5, 73.0, -54.0)...');
bot.chat('alpha: Entering Nether portal now to unite with Beta & Gamma for Milestone 9!');
const portalRes = await globalThis.enterNetherPortal();
console.log('Portal warp result:', JSON.stringify(portalRes));

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to warp to Nether: still in ${bot.game.dimension}`);
}

bot.chat(`alpha: In the_nether at ${lib.fmt(bot.entity.position)}! Marching to bunker (44, 65, -127) with active shield defense against Hoglins!`);

// 6. March safe waypoints with active shield protection against Hoglins
globalThis.configureFireAvoidance();
console.log('Marching safe waypoints toward bunker...');

for (let i = 0; i < globalThis.NETHER_PILLBOX_WAYPOINTS.length && !checkCancelled(); i++) {
  const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
  if (wp.z < -130) break; // March up to bunker at z=-127
  
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  // Clear fire ahead
  await globalThis.clearFireAhead();

  // If near z=-75..-105 where Hoglin was spotted, raise shield and sneak
  if (wp.z <= -70 && wp.z >= -105) {
    bot.activateItem(true); // Raise shield
    bot.setControlState('sneak', true);
  } else {
    bot.deactivateItem();
    bot.setControlState('sneak', false);
  }

  // Attack any hostile mob within 4m
  const hostile = Object.values(bot.entities).find(e =>
    e.isValid &&
    (e.name === 'hoglin' || e.name === 'zombified_piglin' || e.name === 'blaze') &&
    bot.entity.position.distanceTo(e.position) <= 4.0
  );
  if (hostile) {
    console.log(`Encountered ${hostile.name} at ${lib.fmt(hostile.position)}! Shielding and striking!`);
    await bot.lookAt(hostile.position.offset(0, 1.0, 0), true);
    bot.deactivateItem();
    try { await lib.equipWeapon(); } catch (e) {}
    bot.attack(hostile);
    bot.activateItem(true);
    await sleep(650);
  }

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await globalThis.clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
    } catch (e2) {}
  }
}

bot.clearControlStates();
bot.deactivateItem();

console.log('March complete. Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);
bot.chat(`alpha: Arrived at ${lib.fmt(bot.entity.position)} in ${bot.game.dimension}! HP: ${bot.health.toFixed(1)}/20. United with team for Milestone 9!`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
