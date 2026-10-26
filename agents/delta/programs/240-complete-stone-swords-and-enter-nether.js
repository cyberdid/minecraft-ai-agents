// programs/240-complete-stone-swords-and-enter-nether.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));

bot.pathfinder.stop();
await sleep(200);

// 1. Mine up to 32 cobblestone
const neededCobble = 32 - lib.count('cobblestone');
if (neededCobble > 0) {
  console.log(`Mining ${neededCobble} more cobblestone...`);
  try {
    await lib.collect('cobblestone', neededCobble);
  } catch (e) {
    console.log('Collect error:', e.message);
  }
}
console.log('Cobblestone count:', lib.count('cobblestone'));

// 2. Craft sticks and stone swords
if (lib.count('stone_sword') < 2) {
  try {
    if (lib.count('stick') < 2) {
      console.log('Crafting sticks...');
      await lib.craft('stick', 4);
    }
    console.log('Crafting stone swords...');
    await lib.craft('stone_sword', 2);
  } catch (e) {
    console.log('Craft error:', e.message);
  }
}
console.log('Stone swords:', lib.count('stone_sword'));

// 3. Ascend to surface base / portal
console.log('Ascending to Overworld base & Nether portal...');
try {
  // Waypoint 1: Base surface at (295, 72, -55)
  await bot.pathfinder.goto(new goals.GoalNear(295, 72, -55, 2));
} catch (e) {
  console.log('Goto base error:', e.message);
  await lib.goTo(295, 72, -55, 3);
}

console.log('At base area:', lib.fmt(bot.entity.position));

// 4. Step into Nether portal at (298, 72..73, -54)
console.log('Stepping into Nether portal at (298, 72, -54)...');
bot.chat(`delta: Fully geared with stone swords & ${lib.count('cobblestone')} cobblestone! Entering Nether!`);

try {
  await bot.pathfinder.goto(new goals.GoalBlock(298, 72, -54));
} catch (e) {
  await bot.lookAt(new Vec3(298.5, 72.5, -54.5), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

// 5. Wait for dimension change
console.log('Waiting for dimension transition to the_nether...');
const startTime = Date.now();
while (bot.game.dimension !== 'the_nether' && (Date.now() - startTime < 15000)) {
  await sleep(500);
}

console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension === 'the_nether') {
  bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)}! Moving to Blaze Spawner front!`);
}
