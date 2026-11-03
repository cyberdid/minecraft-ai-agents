// programs/716-give-gold-to-gamma-and-march.js
console.log('=== Program 716: Give Gold to Gamma & March to Covered Tunnel Piglin ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain active shield
bot.activateItem(true);
globalThis.configureFireAvoidance();

// 2. Approach Gamma at Nether portal (46, 66, 2)
console.log('Looking for Gamma at Nether Portal...');
let gamma = bot.players['gamma']?.entity;
if (!gamma || bot.entity.position.distanceTo(gamma.position) > 3.0) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(46.0, 66.0, 2.0, 1.5));
  } catch (e) {
    try { await lib.goTo(46, 66, 2, 2.0, { timeoutMs: 5000 }); } catch (e2) {}
  }
}

gamma = bot.players['gamma']?.entity;
const ingot = bot.inventory.items().find(i => i.name === 'gold_ingot');

if (gamma && ingot) {
  console.log(`Gamma found at ${lib.fmt(gamma.position)} (${bot.entity.position.distanceTo(gamma.position).toFixed(1)}m)!`);
  console.log(`Tossing ${ingot.count} gold_ingots to Gamma for Piglin bartering...`);
  await bot.lookAt(gamma.position.offset(0, 1.0, 0), true);
  try {
    await bot.toss(ingot.type, null, ingot.count);
    bot.chat(`alpha: Gamma! Passed you ${ingot.count} gold ingots! You have golden_boots active, barter with the Piglin at (44, 65, -145)!`);
    await sleep(1500);
  } catch (err) {
    console.log('Toss error:', err.message);
  }
} else if (!gamma) {
  console.log('Gamma not right at portal; marching to covered tunnel to meet Beta and Gamma.');
}

// 3. March covered waypoints towards (44, 65, -145)
const COVERED_WAYPOINTS = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 66, z: -35 },
  { x: 62, y: 67, z: -50 },
  { x: 61, y: 66, z: -100 },
  { x: 50, y: 65, z: -115 },
  { x: 44, y: 65, z: -127 },
  { x: 44, y: 65, z: -145 }
];

console.log('Marching along safe waypoints to Piglin tunnel at (44, 65, -145)...');
for (let i = 0; i < COVERED_WAYPOINTS.length; i++) {
  if (checkCancelled()) break;
  const wp = COVERED_WAYPOINTS[i];
  if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 3.0) continue;

  console.log(`Advancing to WP ${i + 1}/${COVERED_WAYPOINTS.length} (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
  } catch (e) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 6000 }); } catch (e2) {}
  }

  // Vacuum any drops along the way (Ender Pearls, items)
  await lib.pickup(4.0);
}

// 4. At (44, 65, -145) tunnel: check for Piglins and drops
console.log('Arrived at covered tunnel! Checking for Piglins and drops at:', lib.fmt(bot.entity.position));
await lib.pickup(6.0);

const nearbyPiglins = Object.values(bot.entities)
  .filter(e => e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 20);

console.log(`Found ${nearbyPiglins.length} Piglins near tunnel:`);
for (const pig of nearbyPiglins) {
  console.log(` - Piglin at ${lib.fmt(pig.position)} (dist ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m)`);
}

// Check for Endermen to hunt
const endermen = Object.values(bot.entities)
  .filter(e => e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 12);
if (endermen.length > 0) {
  const em = endermen[0];
  console.log(`Enderman nearby at ${lib.fmt(em.position)}!`);
  try {
    await lib.equipWeapon();
    await bot.lookAt(em.position.offset(0, 0.4, 0), true);
    bot.attack(em);
    await sleep(500);
    bot.attack(em);
    await lib.pickup(5.0);
  } catch (e) {}
}

const pearls = lib.count('ender_pearl');
console.log(`=== Milestone 9 Progress: Alpha holds ${pearls}/12 Ender Pearls ===`);
bot.chat(`alpha: Reached covered tunnel at (44, 65, -145)! Ender Pearls held: ${pearls}/12, Gold Ingots: ${lib.count('gold_ingot')}, HP: ${bot.health.toFixed(1)}/20`);

console.log('=== Program 716 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'Inv:', lib.inv());
