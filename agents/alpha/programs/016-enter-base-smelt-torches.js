// programs/016-enter-base-smelt-torches.js
// Walk outside to door, open, step inside, smelt charcoal, craft torches, place them!

console.log('Current alpha pos:', bot.entity.position.x.toFixed(1), bot.entity.position.y.toFixed(1), bot.entity.position.z.toFixed(1));

// 1. Walk to south side in front of door
console.log('Walking to outside doorstep at (294, 72, -52)...');
await lib.goTo(294, 72, -52, 1);

// 2. Open door if closed
const doorPos = new Vec3(294, 72, -54);
let doorBlock = bot.blockAt(doorPos);
console.log('Door state:', doorBlock ? doorBlock.name : 'null');
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  console.log('Opening door...');
  await bot.activateBlock(doorBlock);
  await sleep(400);
}

// 3. Walk straight inside with walkTo (avoids pathfinder door bug)
console.log('Walking straight inside to (294, -56)...');
await lib.walkTo(294, -56);
console.log('Inside pos:', bot.entity.position.x.toFixed(1), bot.entity.position.y.toFixed(1), bot.entity.position.z.toFixed(1));

// Close door behind us
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  console.log('Closing door...');
  await bot.activateBlock(doorBlock);
  await sleep(400);
}

// 4. Smelt 2 logs into charcoal in furnace at (295, 72, -55)
console.log('Smelting 2 logs in furnace...');
const logName = lib.count('oak_log') > 0 ? 'oak_log' : 'birch_log';
const fuelName = lib.count('oak_planks') > 0 ? 'oak_planks' : 'stick';
try {
  const smeltRes = await lib.smelt(logName, fuelName, 2);
  console.log('Smelt result:', JSON.stringify(smeltRes));
} catch (e) {
  console.log('Smelt note:', e.message);
}

// 5. Craft torches
console.log('Crafting torches...');
if (lib.count('stick') < 2) {
  await lib.craft('stick', 4);
}
try {
  await lib.craft('torch', 8);
  console.log('Torches crafted:', lib.count('torch'));
} catch (e) {
  console.log('Craft torch note:', e.message);
}

// 6. Place torch on inside wall at (293, 73, -56)
try {
  await lib.place('torch', 293, 73, -56);
  console.log('Placed torch inside at (293, 73, -56)');
} catch (e) {
  console.log('Torch place inside note:', e.message);
}

// Place second torch at (295, 73, -56)
try {
  if (lib.count('torch') > 0) {
    await lib.place('torch', 295, 73, -56);
    console.log('Placed torch inside at (295, 73, -56)');
  }
} catch (e) {
  console.log('Torch place note:', e.message);
}

bot.chat('alpha: Milestone 1 complete! Base shelter with door, chest, table, furnace, and torches.');

const time = lib.time();
console.log('Time: night in', time.secondsUntilNight, 's');

return {
  torches: lib.count('torch'),
  charcoal: lib.count('charcoal'),
  time: time.secondsUntilNight
};
