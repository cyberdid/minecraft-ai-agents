// programs/878-enter-nether-and-march-to-bunker.js
console.log('=== Program 878: Enter Nether & March to Fortress Bunker ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden_boots on feet
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
console.log(`Feet armor: ${bot.inventory.slots[8]?.name}`);

// 1. Enter Nether portal
if (bot.game.dimension === 'overworld') {
  console.log('Entering Nether Portal from Overworld...');
  bot.chat('Beta: Entering Nether Portal now!');
  await enterNetherPortal(25000);
}

console.log(`Current dimension: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

if (bot.game.dimension !== 'the_nether') {
  throw new Error('Failed to warp into the_nether');
}

// 2. Clear fire around Nether portal exit immediately
console.log('Clearing any fire around portal exit...');
globalThis.configureFireAvoidance();
for (let r = 0; r < 5; r++) {
  await globalThis.clearFireAhead();
  await sleep(150);
}

// Equip sword
const weapon = bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (weapon) await bot.equip(weapon, 'hand');

// 3. March safe waypoints to Fortress Workshop Bunker (44, 65, -132)
bot.chat('Beta: In Nether! Marching to Fortress Workshop Bunker (44, 65, -132) to join team!');

const bunkerWps = [
  new Vec3(46, 65, -7),
  new Vec3(54, 65, -7),
  new Vec3(63, 64, -7),
  new Vec3(63, 65, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61.5, 67, -55),
  new Vec3(61.5, 67, -60),
  new Vec3(61.5, 67, -65),
  new Vec3(61.5, 67, -70),
  new Vec3(61.5, 67, -75),
  new Vec3(62.0, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -133)
];

let startIdx = 0;
for (let i = 0; i < bunkerWps.length; i++) {
  if (bot.entity.position.distanceTo(bunkerWps[i]) < 3.0) {
    startIdx = i + 1;
  }
}

console.log(`Starting march from WP ${startIdx}/${bunkerWps.length}...`);

for (let i = startIdx; i < bunkerWps.length && !checkCancelled(); i++) {
  await globalThis.clearFireAhead();

  const wp = bunkerWps[i];
  if (bot.entity.position.distanceTo(wp) < 2.0) continue;

  console.log(`Marching to WP ${i + 1}/${bunkerWps.length}: ${lib.fmt(wp)}`);
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    console.log(`Pathfinder note: ${e.message}`);
    try {
      await globalThis.clearFireAhead();
      await lib.goTo(wp.x, wp.y, wp.z, 2.0, { dig: false, timeoutMs: 6000 });
    } catch (e2) {}
  }

  await globalThis.clearFireAhead();
  await lib.pickup(3.0);

  if (bot.health <= 7) {
    console.log(`Health low (${bot.health}), pausing march in cover.`);
    break;
  }
}

console.log(`March complete! Current pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

// Scan for teammates
for (const [name, pl] of Object.entries(bot.players)) {
  if (name === bot.username) continue;
  if (pl && pl.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(pl.entity.position)} (dist: ${bot.entity.position.distanceTo(pl.entity.position).toFixed(1)}m)`);
  }
}

// Scan for Piglins and Endermen
const nearbyMobs = Object.values(bot.entities).filter(e =>
  e.isValid &&
  bot.entity.position.distanceTo(e.position) <= 24 &&
  ['piglin', 'enderman', 'zombified_piglin', 'blaze'].includes(e.name)
);

console.log(`Nearby Nether mobs (${nearbyMobs.length}):`);
for (const m of nearbyMobs) {
  console.log(`  ${m.name} at ${lib.fmt(m.position)} (dist: ${bot.entity.position.distanceTo(m.position).toFixed(1)}m)`);
}

bot.chat(`Beta: Arrived at Fortress Bunker ${lib.fmt(bot.entity.position)}! Ready to gather pearls!`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  mobs: nearbyMobs.map(m => m.name)
};
