// programs/010-check-chest-and-smelt-torches.js
// Check chest contents, reply to beta, craft/smelt torches if materials available

const chestPos = { x: 293, y: 72, z: -57 };
let contents = {};
try {
  contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(contents));
} catch (e) {
  console.log('Chest read note:', e.message);
}

// Check if crafting table is at (294, 72, -53) outside
const outsideBlock = lib.blockAt(294, 72, -53);
console.log('Block at (294, 72, -53):', outsideBlock ? outsideBlock.name : 'none');

// Check if we can make torches
// Smelting 1 log into charcoal gives 1 charcoal = 4 torches
if (contents.oak_log > 0 || contents.birch_log > 0 || contents.spruce_log > 0) {
  console.log('Withdrawing logs from chest for charcoal...');
  const logType = contents.oak_log ? 'oak_log' : (contents.birch_log ? 'birch_log' : 'spruce_log');
  await lib.withdraw({ [logType]: 2 }, chestPos.x, chestPos.y, chestPos.z);
  if (contents.oak_planks > 0) {
    await lib.withdraw({ oak_planks: 2 }, chestPos.x, chestPos.y, chestPos.z);
  }
}

if (lib.count('*_log') > 0 && (lib.count('*_planks') > 0 || lib.count('stick') >= 2)) {
  console.log('Smelting 1 log into charcoal in furnace...');
  const fuel = lib.count('*_planks') > 0 ? 'oak_planks' : 'stick';
  const logName = lib.count('oak_log') > 0 ? 'oak_log' : (lib.find('*_log')[0]?.name || 'oak_log');
  try {
    const smeltRes = await lib.smelt(logName, fuel, 1);
    console.log('Smelt result:', JSON.stringify(smeltRes));
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
}

if (lib.count('charcoal') > 0 || lib.count('coal') > 0) {
  console.log('Crafting torches...');
  try {
    await lib.craft('torch', 4);
    console.log('Torches count:', lib.count('torch'));
  } catch (e) {
    console.log('Craft torch note:', e.message);
  }
}

// If we have torches, place one inside the base on wall (293, 73, -56)
if (lib.count('torch') > 0) {
  try {
    await lib.place('torch', 293, 73, -56);
    console.log('Torch placed at (293, 73, -56)');
  } catch (e) {
    console.log('Torch place note:', e.message);
  }
}

bot.chat('alpha: Checking chest for logs/coal to make torches. Base is safe.');

const time = lib.time();
console.log('Time:', time.phase, 'timeOfDay:', time.timeOfDay);
console.log('Hostiles (16):', JSON.stringify(lib.hostiles(16)));

return {
  chest: contents,
  torches: lib.count('torch'),
  time: time,
  hostiles: lib.hostiles(16)
};
