// programs/260-gear-up-and-enter-nether.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(150);

// 1. Collect 4 logs
console.log('Collecting 4 logs...');
await lib.collect('*_log', 4);
console.log('Logs collected! Logs in inv:', lib.count('*_log'));

// 2. Craft planks, sticks, wooden pickaxe
console.log('Crafting wooden pickaxe...');
const logName = bot.inventory.items().find(i => i.name.endsWith('_log'))?.name || 'oak_log';
const plankName = logName.replace(/_log$/, '_planks');
await lib.craft(plankName, 12);
await lib.craft('stick', 4);
await lib.craft('wooden_pickaxe', 1);
console.log('Wooden pickaxe crafted!');

// 3. Move into mine shaft where stone is exposed
console.log('Descending into main mine shaft for stone...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(302, 71, -44, 2));
} catch (e) {}

try {
  await bot.pathfinder.goto(new goals.GoalNear(304, 60, -55, 2));
} catch (e) {}

console.log('Pos in shaft:', lib.fmt(bot.entity.position));

// 4. Mine stone and craft stone_pickaxe
console.log('Mining stone for stone_pickaxe...');
const stoneBlocks = bot.findBlocks({ matching: b => b.name === 'stone' || b.name === 'deepslate', maxDistance: 4, count: 5 });
for (const p of stoneBlocks) {
  if (lib.count('cobblestone') >= 3) break;
  try {
    await lib.dig(p.x, p.y, p.z);
    await lib.pickup(3);
  } catch (e) {}
}

await lib.craft('stone_pickaxe', 1);
console.log('Stone pickaxe ready!');

// 5. Mine 24 cobblestone with stone pickaxe
console.log('Mining 24 cobblestone...');
const targetCobble = 24;
while (lib.count('cobblestone') < targetCobble && !isCancelled()) {
  const stones = bot.findBlocks({ matching: b => b.name === 'stone' || b.name === 'deepslate', maxDistance: 4, count: 10 });
  if (stones.length === 0) break;
  for (const p of stones) {
    if (lib.count('cobblestone') >= targetCobble || isCancelled()) break;
    try {
      await lib.dig(p.x, p.y, p.z);
    } catch (e) {}
  }
  await lib.pickup(4);
}
console.log('Cobblestone count:', lib.count('cobblestone'));

// 6. Craft stone swords
console.log('Crafting stone swords...');
try {
  if (lib.count('stick') < 2) {
    await lib.craft('stick', 4);
  }
  await lib.craft('stone_sword', 2);
  console.log('Stone swords ready!');
} catch (e) {
  console.log('Sword craft note:', e.message);
}

// 7. Ascend and enter Nether portal
console.log('Ascending to Nether portal at (298, 72, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(298, 72, -54, 2));
} catch (e) {}

console.log('Stepping into portal frame...');
bot.chat(`delta: Geared with stone tools & ${lib.count('cobblestone')} cobble! Entering Nether!`);

await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
bot.setControlState('jump', true);
bot.setControlState('forward', true);
await sleep(800);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

const start = Date.now();
while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 15000)) {
  await sleep(500);
}

console.log('Result dim:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension === 'the_nether') {
  bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble & stone swords!`);
}
