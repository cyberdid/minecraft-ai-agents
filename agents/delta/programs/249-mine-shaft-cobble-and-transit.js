// programs/249-mine-shaft-cobble-and-transit.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));

bot.pathfinder.stop();
await sleep(150);

// 1. Walk into the main mine shaft where solid stone is exposed
console.log('Walking to main mine shaft at (302, 71, -44)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(302, 71, -44, 2));
} catch (e) {
  console.log('Mine entrance path note:', e.message);
}

// Descend slightly into the shaft to reach exposed stone
console.log('Descending into shaft for stone...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(304, 60, -55, 2));
} catch (e) {
  console.log('Shaft descend note:', e.message);
}

console.log('Pos in shaft:', lib.fmt(bot.entity.position));

// 2. Obtain stone_pickaxe
if (lib.count('stone_pickaxe') < 1) {
  console.log('Mining stone for stone_pickaxe...');
  // Find adjacent stone block
  const stoneBlocks = bot.findBlocks({
    matching: b => b.name === 'stone' || b.name === 'deepslate',
    maxDistance: 4,
    count: 5
  });
  console.log('Nearby stone blocks:', stoneBlocks.length);
  for (const p of stoneBlocks) {
    if (lib.count('cobblestone') >= 3) break;
    try {
      await lib.dig(p.x, p.y, p.z);
      await lib.pickup(3);
    } catch (e) {}
  }
  
  // Craft stone pickaxe
  console.log('Crafting stone_pickaxe...');
  await lib.craft('stone_pickaxe', 1);
  console.log('Stone pickaxe crafted!');
}

// 3. Mine 32 cobblestone with stone pickaxe
console.log('Mining 32 cobblestone...');
const targetCobble = 32;
while (lib.count('cobblestone') < targetCobble && !isCancelled()) {
  const stones = bot.findBlocks({
    matching: b => b.name === 'stone' || b.name === 'deepslate',
    maxDistance: 4,
    count: 10
  });
  if (stones.length === 0) {
    // Collect using lib
    await lib.collect('cobblestone', targetCobble - lib.count('cobblestone'));
    break;
  }
  for (const p of stones) {
    if (lib.count('cobblestone') >= targetCobble || isCancelled()) break;
    try {
      await lib.dig(p.x, p.y, p.z);
    } catch (e) {}
  }
  await lib.pickup(4);
}
console.log('Cobblestone count:', lib.count('cobblestone'));

// 4. Craft stone swords
try {
  if (lib.count('stick') < 2) {
    await lib.craft('stick', 4);
  }
  if (lib.count('stone_sword') < 2) {
    await lib.craft('stone_sword', 2);
  }
  console.log('Stone swords ready:', lib.count('stone_sword'));
} catch (e) {
  console.log('Sword craft note:', e.message);
}

// 5. Ascend to surface base and enter Nether Portal
console.log('Ascending to Overworld base & Nether portal...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(298, 72, -54, 2));
} catch (e) {
  console.log('Ascend note:', e.message);
}

console.log('At portal area:', lib.fmt(bot.entity.position));
bot.chat(`delta: Re-armed with stone swords & ${lib.count('cobblestone')} cobble! Stepping into Nether portal!`);

// Step into portal
await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
bot.setControlState('jump', true);
bot.setControlState('forward', true);
await sleep(700);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Inside portal frame. Waiting for dimension transition...');
const start = Date.now();
while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 15000)) {
  await sleep(500);
}

console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension === 'the_nether') {
  bot.chat(`delta: Re-entered Nether at ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble! Advancing to Spawner!`);
}
