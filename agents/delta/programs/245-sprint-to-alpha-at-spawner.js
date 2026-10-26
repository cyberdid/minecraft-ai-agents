// programs/245-sprint-to-alpha-at-spawner.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(100);

// Equip stone sword in hand for defense if needed
await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');

bot.chat('delta: Sprinting through covered East Ridge tunnel to Alpha at (44, 65, -172)!');

const waypoints = [
  new Vec3(50, 65, -6),
  new Vec3(63, 65, -5),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -160),
  new Vec3(44, 65, -172)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (e) {
    console.log(`Path note to ${lib.fmt(wp)}:`, e.message);
    // Short fallback nudge
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y + 1, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(400);
    bot.setControlState('forward', false);
  }
}

console.log('Current pos after travel:', lib.fmt(bot.entity.position));

// Check players nearby
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist: ${d.toFixed(1)}m)`);
  }
}

// If Alpha is near, toss a stone sword
const alpha = bot.players.alpha?.entity;
if (alpha && bot.entity.position.distanceTo(alpha.position) < 6) {
  if (lib.count('stone_sword') > 1) {
    console.log('Tossing stone_sword to Alpha...');
    await bot.lookAt(alpha.position.offset(0, 1, 0), true);
    await bot.toss(mcData.itemsByName.stone_sword.id, null, 1);
    bot.chat('delta: Alpha, tossed you the stone_sword! Ready to build spawner box!');
  }
}

bot.chat(`delta: Stationed at Spawner front ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble! Ready to build!`);
