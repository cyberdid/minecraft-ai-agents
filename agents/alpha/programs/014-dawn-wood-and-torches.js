// programs/014-dawn-wood-and-torches.js
// Wait until dawn (23460), check hostiles, harvest wood, smelt charcoal, craft torches

console.log('Current timeOfDay:', lib.time().timeOfDay);

// Wait until tick 23460 (dawn)
while (!isCancelled()) {
  const t = lib.time();
  if (t.timeOfDay >= 23460 || (t.timeOfDay >= 0 && t.timeOfDay < 12000)) {
    console.log(`Dawn reached! timeOfDay: ${t.timeOfDay}, phase: ${t.phase}`);
    break;
  }
  await sleep(4000);
}

// Check hostiles outside before opening door
const hostiles = lib.hostiles(16);
console.log('Hostiles within 16 blocks:', JSON.stringify(hostiles));

// If any creeper within 8 blocks, wait a bit or do not step out
const creeperNear = hostiles.some(h => h.name === 'creeper' && h.dist < 8);
if (creeperNear) {
  console.log('Creeper near door outside! Waiting inside.');
  bot.chat('alpha: Creeper outside door, holding inside until safe.');
  return { status: 'waiting_for_creeper', hostiles };
}

// Exit through door to harvest wood
bot.chat('alpha: Dawn arrived! Going out to gather wood for torches.');
console.log('Stepping through door...');
await lib.goThroughDoor(294, 72, -54);

console.log('Collecting 4 logs...');
try {
  const got = await lib.collect('*_log', 4);
  console.log('Harvested logs:', JSON.stringify(got));
} catch (e) {
  console.log('Harvest wood note:', e.message);
}

// Return to base through door
console.log('Returning to base...');
await lib.goTo(294, 72, -54, 2);
await lib.goThroughDoor(294, 72, -54);
console.log('Back inside base at:', lib.fmt(bot.entity.position));

// Smelt 1 log into charcoal in furnace at (295, 72, -55)
if (lib.count('*_log') > 0 && lib.count('*_planks') > 0) {
  console.log('Smelting 1 log into charcoal...');
  try {
    const logType = lib.count('oak_log') > 0 ? 'oak_log' : 'birch_log';
    const smeltRes = await lib.smelt(logType, 'oak_planks', 1);
    console.log('Smelt result:', JSON.stringify(smeltRes));
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
}

// Craft torches
if (lib.count('charcoal') > 0 || lib.count('coal') > 0) {
  try {
    if (lib.count('stick') === 0) {
      await lib.craft('stick', 4);
    }
    await lib.craft('torch', 4);
    console.log('Torches crafted! Total:', lib.count('torch'));
  } catch (e) {
    console.log('Craft torch note:', e.message);
  }
}

// Place torch inside base on wall (293, 73, -56)
if (lib.count('torch') > 0) {
  try {
    await lib.place('torch', 293, 73, -56);
    console.log('Torch placed inside base at (293, 73, -56)!');
  } catch (e) {
    console.log('Place torch note:', e.message);
  }
}

bot.chat('alpha: Torches made and placed! Milestone 1 (Base) complete!');

return {
  torches: lib.count('torch'),
  time: lib.time(),
  hostiles: lib.hostiles(16)
};
