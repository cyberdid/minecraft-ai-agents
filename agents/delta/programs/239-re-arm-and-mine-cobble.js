// programs/239-re-arm-and-mine-cobble.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(200);

// 1. Check door and step outside
const doorBlock = bot.findBlocks({ matching: b => b.name.endsWith('_door'), maxDistance: 10, count: 1 })[0];
console.log('Door at:', doorBlock ? lib.fmt(doorBlock) : 'none');
if (doorBlock) {
  try {
    console.log('Going through door to outside...');
    await lib.goThroughDoor(doorBlock.x, doorBlock.y, doorBlock.z);
    console.log('Outside base! Pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Door passage note:', e.message);
  }
}

// 2. Obtain stone pickaxe
console.log('Obtaining stone_pickaxe...');
await lib.obtain('stone_pickaxe', 1);
console.log('Stone pickaxe obtained! Inventory:', JSON.stringify(lib.inv()));

// 3. Craft stone swords
console.log('Crafting stone swords...');
try {
  await lib.craft('stone_sword', 2);
  console.log('Crafted stone swords!');
} catch (e) {
  console.log('Craft sword info:', e.message);
}

// 4. Collect 32 cobblestone
console.log('Collecting cobblestone for Nether bridge...');
const currentCobble = lib.count('cobblestone');
if (currentCobble < 32) {
  await lib.collect('cobblestone', 32 - currentCobble);
}
console.log('Cobblestone count:', lib.count('cobblestone'));

bot.chat(`delta: Re-armed with stone gear and ${lib.count('cobblestone')} cobblestone! Heading to Nether portal!`);

// 5. Walk to Nether portal at (298, 72, -54)
console.log('Moving to Nether portal at (298, 72, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(298, 73, -54));
} catch (e) {
  await bot.pathfinder.goto(new goals.GoalNear(298, 72, -54, 1));
}

console.log('Delta pos near portal:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
