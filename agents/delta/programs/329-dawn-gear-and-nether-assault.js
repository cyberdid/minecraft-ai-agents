// programs/329-dawn-gear-and-nether-assault.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Exit base through door
console.log('Exiting base door at dawn...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 1));
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {}
}
console.log('Outside base! Pos:', lib.fmt(bot.entity.position));

// 2. Gather 2 logs
console.log('Collecting 2 logs...');
await lib.collect('*_log', 2);

// 3. Craft planks & sticks
const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (logItem) {
  const plankName = logItem.name.replace('_log', '_planks');
  await lib.craft(plankName, 8);
}
if (lib.count('stick') < 4) await lib.craft('stick', 4);

// 4. Craft wooden pickaxe
await lib.craft('wooden_pickaxe', 1);

// 5. Mine 3 cobblestone -> craft stone pickaxe
console.log('Mining initial cobblestone...');
await lib.collect('cobblestone', 3);
await lib.craft('stone_pickaxe', 1);

// 6. Mine 30 cobblestone with stone pickaxe
console.log('Mining 30 cobblestone with stone pickaxe...');
await lib.collect('cobblestone', 30);

// 7. Craft stone sword
if (lib.count('stick') < 1) await lib.craft('stick', 4);
await lib.craft('stone_sword', 1);

// Equip sword
const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
if (sword) await bot.equip(sword, 'hand');

console.log('Ready! Cobblestone count:', lib.count('cobblestone'));
bot.chat(`delta: Geared with stone sword & ${lib.count('cobblestone')} cobble! Entering Nether portal!`);

// 8. Move to Nether Portal at (299.5, 73.0, -53.5)
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
  console.log('Not in Nether! Aborting.');
  return;
}

// 9. Safe exit at z=-8.0
console.log('Exiting bunker at z=-8.0...');
await lib.walkTo(40.5, -8.0, 2000);
bot.clearControlStates();

// 10. Follow valley floor to East Ridge (63, 65, -8)
const toRidge = [
  new Vec3(48, 65, -8),
  new Vec3(56, 65, -8),
  new Vec3(63, 65, -8)
];
for (const wp of toRidge) {
  try { await lib.goTo(wp.x, wp.y, wp.z, 1, { timeoutMs: 8000 }); } catch (e) {}
}

// 11. Sprint through covered corridor to frontline
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
