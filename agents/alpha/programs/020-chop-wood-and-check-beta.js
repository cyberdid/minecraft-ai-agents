// programs/020-chop-wood-and-check-beta.js
// Harvest wood, return to base, craft pickaxe, coordinate with beta

console.log('alpha at:', lib.fmt(bot.entity.position));

// 1. Collect 6 logs
console.log('Collecting 6 logs...');
try {
  const got = await lib.collect('*_log', 6);
  console.log('Wood gained:', JSON.stringify(got));
} catch (e) {
  console.log('Wood error:', e.message);
}

// 2. Return to base
console.log('Returning to base...');
await lib.goTo(294, 72, -52, 1);

const doorPos = new Vec3(294, 72, -54);
let doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Stepping inside...');
await lib.walkTo(294, -56);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Craft planks, sticks, wooden pickaxe
if (lib.count('*_log') > 0) {
  await lib.craft('oak_planks', 12);
  await lib.craft('stick', 4);
  if (lib.count('*_pickaxe') === 0) {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Crafted wooden_pickaxe');
  }
}

// 4. Check beta's status and bed
const beta = bot.players['beta'];
if (beta && beta.entity) {
  console.log('beta pos:', lib.fmt(beta.entity.position));
}

// Check beds in base
const beds = lib.find('*_bed', { maxDistance: 10, count: 5 });
console.log('Beds found in base:', beds.length);
if (beds.length > 0) {
  try {
    await lib.setSpawn();
    console.log('Spawn set at bed!');
  } catch (e) {
    console.log('Set spawn note:', e.message);
  }
}

bot.chat('alpha: Inside base with wood and tools. Spawn set.');

const time = lib.time();
console.log('Time until night:', time.secondsUntilNight, 's');

return {
  inv: lib.inv(),
  beds: beds.length,
  time: time.secondsUntilNight
};
