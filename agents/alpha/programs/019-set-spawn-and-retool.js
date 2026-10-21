// programs/019-set-spawn-and-retool.js
// Withdraw sword/food from chest, set spawn at bed, coordinate with beta, chop wood

const chestPos = { x: 293, y: 72, z: -57 };

// 1. Withdraw sword and food
try {
  await lib.withdraw({ stone_sword: 1, cooked_mutton: 2, cooked_beef: 1 }, chestPos.x, chestPos.y, chestPos.z);
  console.log('Withdrew food and stone_sword');
} catch (e) {
  console.log('Withdraw note:', e.message);
}

// 2. Set spawn at the bed
try {
  console.log('Setting spawn at bed...');
  await lib.setSpawn();
  console.log('Spawn set successfully!');
} catch (e) {
  console.log('Set spawn note:', e.message);
}

// 3. Chat with beta
bot.chat('alpha: Spawn set! Dropped items were at (289.7, 52.2, -53.3) in water cave, too dangerous. Chopping wood on surface now.');

// 4. Step outside to harvest 8 logs for tools/torches
const doorPos = new Vec3(294, 72, -54);
let doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Stepping outside...');
await lib.walkTo(294, -51);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}

console.log('Harvesting 8 logs...');
try {
  const got = await lib.collect('*_log', 8);
  console.log('Harvested logs:', JSON.stringify(got));
} catch (e) {
  console.log('Collect wood note:', e.message);
}

// 5. Return inside base before night
console.log('Returning to base doorstep...');
await lib.goTo(294, 72, -52, 1);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
await lib.walkTo(294, -56);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Back inside base at:', lib.fmt(bot.entity.position));

// 6. Craft wooden pickaxe and gather some cobblestone if needed
if (lib.count('*_log') > 0) {
  await lib.craft('oak_planks', 8);
  await lib.craft('stick', 4);
  if (lib.count('*_pickaxe') === 0) {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Crafted wooden_pickaxe');
  }
}

const time = lib.time();
console.log('Time until night:', time.secondsUntilNight, 's');

return {
  inv: lib.inv(),
  time: time.secondsUntilNight
};
