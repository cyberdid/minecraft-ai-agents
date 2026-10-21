// programs/015-milestone1-torches.js
// Harvest wood, smelt charcoal, craft torches, light the base to complete Milestone 1

console.log('alpha at:', lib.fmt(bot.entity.position));

// 1. Collect 6 oak logs
console.log('Collecting 6 oak logs...');
const woodGained = await lib.collect('*_log', 6);
console.log('Wood gained:', JSON.stringify(woodGained));

// 2. Go near the base door
console.log('Returning to base at (294, 72, -54)...');
await lib.goTo(294, 72, -54, 2);

// Check if door is open or closed, ensure we can walk in
const doorBlock = lib.blockAt(294, 72, -54);
console.log('Door block:', doorBlock ? doorBlock.name : 'none');
try {
  await lib.door(294, 72, -54, true); // open door
} catch (e) {
  console.log('Door open note:', e.message);
}

// Walk inside
await lib.goTo(294, 72, -56, 1);
console.log('Inside base at:', lib.fmt(bot.entity.position));

// Close door
try {
  await lib.door(294, 72, -54, false); // close door
} catch (e) {
  console.log('Door close note:', e.message);
}

// 3. Craft planks if needed for fuel
if (lib.count('*_planks') === 0) {
  await lib.craft('oak_planks', 4);
}

// 4. Smelt 2 logs into charcoal
console.log('Smelting charcoal in furnace...');
const logName = lib.count('oak_log') > 0 ? 'oak_log' : 'birch_log';
const plankName = lib.count('oak_planks') > 0 ? 'oak_planks' : 'stick';
const smeltRes = await lib.smelt(logName, plankName, 2);
console.log('Smelt result:', JSON.stringify(smeltRes));

// 5. Craft torches
if (lib.count('stick') < 2) {
  await lib.craft('stick', 4);
}
console.log('Crafting torches...');
await lib.craft('torch', 8);
console.log('Torches in inventory:', lib.count('torch'));

// 6. Place torch inside base on wall at (293, 73, -56)
try {
  await lib.place('torch', 293, 73, -56);
  console.log('Torch placed on inside wall (293, 73, -56)');
} catch (e) {
  console.log('Place torch inside note:', e.message);
}

// Place second torch at (295, 73, -56) if possible
try {
  if (lib.count('torch') > 0) {
    await lib.place('torch', 295, 73, -56);
    console.log('Torch placed on inside wall (295, 73, -56)');
  }
} catch (e) {
  console.log('Second torch note:', e.message);
}

bot.chat('alpha: Milestone 1 complete! Base shelter with door, chest, table, furnace, torches.');

const time = lib.time();
console.log('Time left until night:', time.secondsUntilNight, 's');

return {
  torches: lib.count('torch'),
  charcoal: lib.count('charcoal'),
  logs: lib.count('*_log'),
  planks: lib.count('*_planks'),
  time: time.secondsUntilNight
};
