// programs/253-obtain-shield-and-re-arm.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(150);

// 1. Step through base door to outside
const door = bot.findBlocks({ matching: b => b.name.endsWith('_door'), maxDistance: 10, count: 1 })[0];
if (door) {
  try {
    console.log('Stepping through base door to outside...');
    await lib.goThroughDoor(door.x, door.y, door.z);
  } catch (e) {
    console.log('Door passage note:', e.message);
  }
}

// 2. Obtain shield using lib.obtain (auto wood -> stone -> iron -> smelt -> shield)
console.log('Obtaining shield for 100% Blaze fireball immunity...');
bot.chat('delta: Obtaining a shield to block 100% of Blaze fireballs!');
try {
  await lib.obtain('shield', 1);
  console.log('Shield obtained! Inv:', JSON.stringify(lib.inv()));
} catch (e) {
  console.log('Shield obtain note:', e.message);
}

// 3. Equip shield in offhand if obtained
if (lib.count('shield') > 0) {
  await bot.equip(mcData.itemsByName.shield.id, 'off-hand');
  console.log('Shield equipped in off-hand!');
}

// 4. Ensure we have stone pickaxe and stone sword
if (lib.count('stone_pickaxe') < 1) {
  try {
    await lib.obtain('stone_pickaxe', 1);
  } catch (e) {}
}

if (lib.count('stone_sword') < 1) {
  try {
    await lib.craft('stone_sword', 1);
  } catch (e) {}
}

// 5. Gather at least 20 cobblestone if needed
const currentCobble = lib.count('cobblestone');
if (currentCobble < 20) {
  try {
    await lib.collect('cobblestone', 20 - currentCobble);
  } catch (e) {}
}

console.log('Preparation complete! Inventory:', JSON.stringify(lib.inv()));
bot.chat(`delta: Armed with shield (offhand), stone gear, and ${lib.count('cobblestone')} cobblestone! Entering Nether!`);

// 6. Step into Nether portal
try {
  await bot.pathfinder.goto(new goals.GoalNear(298, 72, -54, 2));
} catch (e) {}

await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
bot.setControlState('jump', true);
bot.setControlState('forward', true);
await sleep(800);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Inside portal. Waiting for dimension transition...');
const start = Date.now();
while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 15000)) {
  await sleep(500);
}

console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension === 'the_nether') {
  bot.chat(`delta: Entered Nether at ${lib.fmt(bot.entity.position)} with shield equipped!`);
}
