// programs/735-warp-and-unite-at-bunker.js
console.log('=== Program 735: Warp & Unite at Fortress Bunker ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain offhand shield and iron sword
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

// 2. If in Overworld, warp through Nether portal
if (bot.game.dimension === 'overworld') {
  console.log('In Overworld! Walking to Nether portal at (299.5, 73.0, -54.0)...');
  bot.chat('alpha: In Overworld; warping through Nether portal to unite with Beta, Gamma & Delta at Fortress Bunker (44, 65, -127)!');
  
  try {
    await lib.goToXZ(299.5, -54.0, { timeoutMs: 25000 });
  } catch (e) {}

  const warpRes = await globalThis.enterNetherPortal();
  console.log('enterNetherPortal result:', JSON.stringify(warpRes));
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to reach the_nether: still in ${bot.game.dimension}`);
}

bot.chat(`alpha: In the_nether at ${lib.fmt(bot.entity.position)}! Marching safe East Ridge waypoints to Fortress Bunker (44, 65, -127)!`);

// 3. March safe waypoints up to Fortress Bunker (WP 14 = 44, 65, -127)
globalThis.configureFireAvoidance();
console.log('Marching safe waypoints toward bunker...');

for (let i = 0; i < globalThis.NETHER_PILLBOX_WAYPOINTS.length && !checkCancelled(); i++) {
  const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
  if (wp.z < -128) break; // Stop at bunker at z=-127!

  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  await globalThis.clearFireAhead();

  // Raise shield and sneak through Hoglin cliff zone (z=-70..-105)
  if (wp.z <= -70 && wp.z >= -105) {
    bot.activateItem(true);
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
    console.log(`Encountered ${hostile.name} at ${lib.fmt(hostile.position)}! Shielding & attacking!`);
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

  await lib.pickup(3.0);
}

bot.clearControlStates();
bot.deactivateItem();

console.log('Inside Fortress Bunker at:', lib.fmt(bot.entity.position));
bot.chat(`alpha: United with team at Fortress Bunker (${lib.fmt(bot.entity.position)})! HP: ${bot.health.toFixed(1)}/20. Ready for Milestone 9 bartering & pearls!`);

// 4. Scan teammates at bunker
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const d = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (${d}m), held: ${p.entity.heldItem?.name}`);
  }
}

// 5. Scan Piglins and Endermen within 16m
const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 16);
const endermen = Object.values(bot.entities).filter(e => e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 16);

console.log(`Nearby Piglins: ${piglins.length}, Endermen: ${endermen.length}`);
const pearls = lib.count('ender_pearl');
bot.chat(`alpha: Milestone 9 status: Pearls ${pearls}/12, Piglins: ${piglins.length}, Endermen: ${endermen.length}`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  pearls,
  inv: lib.inv()
};
