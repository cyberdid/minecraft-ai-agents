// programs/247-quarry-full-stack-cobble.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(150);

// 1. Exit base through door if inside
const door = bot.findBlocks({ matching: b => b.name.endsWith('_door'), maxDistance: 10, count: 1 })[0];
if (door) {
  try {
    console.log('Stepping through base door to outside...');
    await lib.goThroughDoor(door.x, door.y, door.z);
  } catch (e) {
    console.log('Door passage note:', e.message);
  }
}

// 2. Obtain stone pickaxe
console.log('Obtaining stone_pickaxe...');
await lib.obtain('stone_pickaxe', 1);
console.log('Stone pickaxe ready! Inv:', JSON.stringify(lib.inv()));

// 3. Mine a full stack of cobblestone (at least 60)
console.log('Quarrying cobblestone (goal: 60+)...');
const currentCobble = lib.count('cobblestone');
if (currentCobble < 60) {
  await lib.collect('cobblestone', 60 - currentCobble);
}
console.log('Cobblestone quarry complete! Count:', lib.count('cobblestone'));

// 4. Craft 2 stone swords for combat
try {
  if (lib.count('stick') < 2) {
    await lib.craft('stick', 4);
  }
  await lib.craft('stone_sword', 2);
  console.log('Crafted 2 stone swords!');
} catch (e) {
  console.log('Craft sword note:', e.message);
}

console.log('Gear preparation complete! Inventory:', JSON.stringify(lib.inv()));
bot.chat(`delta: Fully geared with stone pickaxe, 2 stone swords, and ${lib.count('cobblestone')} cobblestone! Ready for covert advance!`);
