// programs/324-rearm-and-nether-transit.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Step out base door
console.log('Exiting base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 1));
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {}
}
console.log('Outside base! Pos:', lib.fmt(bot.entity.position));

// 2. Obtain stone tools & cobblestone
console.log('Obtaining stone tools & cobblestone...');
await lib.obtain('stone_pickaxe', 1);
await lib.obtain('stone_sword', 1);
await lib.obtain('cobblestone', 24);
console.log('Tools ready! Cobble count:', lib.count('cobblestone'));

// Equip sword
const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
if (sword) await bot.equip(sword, 'hand');

// 3. Move to Nether Portal at (299.5, 73.0, -53.5)
console.log('Moving to Nether Portal...');
try {
  await lib.goTo(299, 72, -52, 1);
} catch (e) {}

bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 3000);
bot.clearControlStates();

console.log('Waiting for Nether transit...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (!String(bot.game.dimension).includes('nether')) {
  console.log('Failed to transit to Nether!');
  return;
}

bot.chat(`delta: Re-entered Nether at ${lib.fmt(bot.entity.position)} armed with stone sword & ${lib.count('cobblestone')} cobble! Sprinting to Spawner Frontline!`);

// 4. Safe exit at z=-8.0
console.log('Exiting bunker at z=-8.0...');
await lib.walkTo(40.5, -8.0, 2000);
bot.clearControlStates();

// 5. Follow valley floor to East Ridge (63, 65, -8)
const toRidge = [
  new Vec3(48, 65, -8),
  new Vec3(56, 65, -8),
  new Vec3(63, 65, -8)
];
for (const wp of toRidge) {
  try { await lib.goTo(wp.x, wp.y, wp.z, 1, { timeoutMs: 8000 }); } catch (e) {}
}

// 6. Sprint through verified open corridor to Frontline
const corridor = [
  new Vec3(63.0, 65.0, -15),
  new Vec3(63.0, 65.0, -30),
  new Vec3(62.0, 65.0, -50),
  new Vec3(62.0, 65.0, -70),
  new Vec3(62.0, 65.0, -90),
  new Vec3(61.0, 65.0, -100),
  new Vec3(50.0, 65.0, -115),
  new Vec3(44.0, 65.0, -127), // Fortress Workshop Bunker
  new Vec3(44.0, 65.0, -145), // Covered Advance Tunnel
  new Vec3(44.0, 65.0, -160),
  new Vec3(44.0, 65.0, -169), // Frontline Blast Wall
  new Vec3(38.0, 65.0, -176)  // Fortified Cross-Bridge
];

for (let i = 0; i < corridor.length && !isCancelled(); i++) {
  const wp = corridor[i];
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1));
  } catch (e) {
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(1500);
    bot.clearControlStates();
  }
  try { await lib.pickup(6); } catch (e) {}
}

console.log('Arrived at fortified cross-bridge! Pos:', lib.fmt(bot.entity.position));
bot.chat(`delta: At fortified cross-bridge ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble & stone sword! Ready to breach Spawner!`);
