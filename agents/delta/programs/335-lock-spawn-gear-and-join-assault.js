// programs/335-lock-spawn-gear-and-join-assault.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Lock spawn on Bed 2
const bedPos = new Vec3(294, 72, -56);
const bedBlock = bot.blockAt(bedPos);
if (bedBlock) {
  try {
    await bot.activateBlock(bedBlock);
    console.log('Spawn locked at Bed 2!');
  } catch (e) {}
}

// 2. Step outside base door
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

// 3. Obtain stone tools & cobblestone
console.log('Obtaining stone tools & 24 cobblestone...');
await lib.obtain('stone_pickaxe', 1);
await lib.obtain('stone_sword', 1);
await lib.obtain('cobblestone', 24);

const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
if (sword) await bot.equip(sword, 'hand');
console.log('Armed! Cobblestone count:', lib.count('cobblestone'));
bot.chat(`delta: Geared with stone sword & ${lib.count('cobblestone')} cobble! Entering Nether portal to join Alpha at Spawner!`);

// 4. Move to Nether Portal at (299.5, 73.0, -53.5)
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
  console.log('Transit incomplete, holding.');
  return;
}

// 5. Safe exit at z=-8.0
console.log('Exiting bunker at z=-8.0...');
await lib.walkTo(40.5, -8.0, 2000);
bot.clearControlStates();

// 6. Follow valley floor to East Ridge (63, 65, -8)
const toRidge = [
  new Vec3(48, 65, -8),
  new Vec3(56, 65, -8),
  new Vec3(63, 65, -8)
];
for (const wp of toRidge) {
  try { await lib.goTo(wp.x, wp.y, wp.z, 1, { timeoutMs: 8000 }); } catch (e) {}
}

// 7. Sprint through covered corridor to frontline
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
bot.chat(`delta: United at Spawner Bridgehead ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble & stone sword! Ready to breach Spawner!`);
