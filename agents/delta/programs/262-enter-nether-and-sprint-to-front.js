// programs/262-enter-nether-and-sprint-to-front.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));

bot.pathfinder.stop();
await sleep(100);

// 1. Step directly into Nether portal block at (299.5, 73.0, -54.0)
if (bot.game.dimension !== 'the_nether') {
  console.log('Stepping North-East into portal block at (299.5, 73.0, -54.0)...');
  await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(700);
  bot.setControlState('forward', false);

  console.log('Inside portal frame at:', lib.fmt(bot.entity.position));
  console.log('Standing still inside portal to trigger teleportation...');

  const start = Date.now();
  while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 15000)) {
    await sleep(500);
  }
}

console.log('Current dim:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension !== 'the_nether') {
  throw new Error('Failed to transit into the_nether');
}

bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)} with 2 stone swords & ${lib.count('cobblestone')} cobble! Sprinting to frontline!`);

// 2. Sprint through fully enclosed East Ridge tunnel to mountain cover
const waypoints = [
  new Vec3(50, 65, -6),
  new Vec3(63, 65, -5),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -145),
  new Vec3(44, 65, -158) // Frontline fortified position
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (e) {
    console.log(`Path note to ${lib.fmt(wp)}:`, e.message);
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y + 1, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(350);
    bot.setControlState('forward', false);
  }
}

console.log('Reached frontline at:', lib.fmt(bot.entity.position));

// 3. Check players nearby
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist: ${d.toFixed(1)}m)`);
  }
}

// 4. Share a stone sword with any nearby teammate needing one
const teammate = Object.values(bot.players).find(p => p.entity && p.username !== 'delta' && bot.entity.position.distanceTo(p.entity.position) < 5);
if (teammate && lib.count('stone_sword') > 1) {
  console.log(`Tossing stone sword to ${teammate.username}...`);
  await bot.lookAt(teammate.entity.position.offset(0, 1, 0), true);
  await bot.toss(mcData.itemsByName.stone_sword.id, null, 1);
  bot.chat(`delta: ${teammate.username}, tossed you a stone_sword! Let us bridge to the Blaze Spawner!`);
}

bot.chat(`delta: Stationed at frontline ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble! Ready to bridge to Spawner Balcony!`);
console.log('Final pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
