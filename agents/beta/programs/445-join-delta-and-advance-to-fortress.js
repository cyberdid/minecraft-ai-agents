// programs/445-join-delta-and-advance-to-fortress.js
console.log('=== Step: Join Delta at Nether bunker, keep gaze low, advance to Fortress ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Keep gaze down to avoid aggroing Enderman
await bot.look(bot.entity.yaw, -0.4, true);

// 2. Locate Delta in bunker
const delta = bot.players['delta']?.entity;
if (delta) {
  console.log(`Delta spotted at ${lib.fmt(delta.position)}!`);
  bot.chat('beta: Delta, toss 1 pickaxe or blocks! Advancing with you along y=65 ridge to Fortress (45, 65, -130)!');
} else {
  console.log('Delta not in direct visual range, moving to bunker center (40, 65, -7)...');
  try {
    await lib.goTo(40, 65, -7, 1);
  } catch (e) {}
}

// 3. Collect any drops on the bunker floor
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8
);
for (const d of drops) {
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.8);
    console.log(`Collected drop at ${lib.fmt(d.position)}!`);
  } catch (e) {}
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));

// 4. Follow ridge trail north towards Fortress Outpost (45, 65, -130)
// Trail: (48, 65, -7) -> (55, 65, -35) -> (54, 64, -67) -> (50, 65, -95) -> (45, 65, -130)
const ridgeWps = [
  new Vec3(48, 65, -7),
  new Vec3(55, 65, -35),
  new Vec3(54, 64, -67),
  new Vec3(50, 65, -95),
  new Vec3(45, 65, -130)
];

for (const wp of ridgeWps) {
  if (isCancelled()) break;
  try {
    console.log(`Advancing to ${lib.fmt(wp)}...`);
    await lib.goTo(wp.x, wp.y, wp.z, 2);
    console.log(`Reached ${lib.fmt(wp)}, pos=${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Nav note to ${lib.fmt(wp)}:`, e.message);
  }
}

console.log(`Trail expedition complete. Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}/20, Food: ${bot.food}/20`);
bot.chat(`beta: On ridge trail at ${lib.fmt(bot.entity.position)}. Advancing with team to Fortress Outpost!`);
