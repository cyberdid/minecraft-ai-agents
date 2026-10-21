// programs/011-interior-setup-and-scan.js
// Place crafting table inside base, scan for ores under base, coordinate night

const chestPos = { x: 293, y: 72, z: -57 };

// 1. Withdraw crafting table if we don't have one
if (lib.count('crafting_table') === 0) {
  try {
    await lib.withdraw({ crafting_table: 1 }, chestPos.x, chestPos.y, chestPos.z);
    console.log('Withdrew crafting table from chest');
  } catch (e) {
    console.log('Withdraw note:', e.message);
  }
}

// 2. Clear dirt block at (295, 72, -56) or (295, 72, -57) to place crafting table
const targetSpot = { x: 295, y: 72, z: -56 };
const currentBlock = lib.blockAt(targetSpot.x, targetSpot.y, targetSpot.z);
console.log('Target spot block:', currentBlock ? currentBlock.name : 'air');
if (currentBlock && currentBlock.name === 'dirt') {
  await lib.dig(targetSpot.x, targetSpot.y, targetSpot.z);
}

if (lib.count('crafting_table') > 0) {
  try {
    await lib.place('crafting_table', targetSpot.x, targetSpot.y, targetSpot.z);
    console.log(`Crafting table placed at ${lib.fmt(targetSpot)}`);
  } catch (e) {
    console.log('Place crafting table note:', e.message);
  }
}

// 3. Scan for ores underground nearby
const coal = lib.find('coal_ore', { maxDistance: 24, count: 5 });
console.log(`Coal ores found within 24 blocks: ${coal.length}`);
if (coal.length > 0) {
  for (const c of coal) {
    console.log(`  coal_ore at ${lib.fmt(c.position)} dist: ${bot.entity.position.distanceTo(c.position).toFixed(1)}`);
  }
}

const iron = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 24, count: 5 });
console.log(`Iron ores found within 24 blocks: ${iron.length}`);
if (iron.length > 0) {
  for (const i of iron) {
    console.log(`  iron_ore at ${lib.fmt(i.position)} dist: ${bot.entity.position.distanceTo(i.position).toFixed(1)}`);
  }
}

bot.chat('alpha: Crafting table and furnace are set up inside base! Chest and door ready.');

const time = lib.time();
console.log('Time:', time.phase, 'timeOfDay:', time.timeOfDay);
console.log('Hostiles (16):', JSON.stringify(lib.hostiles(16)));

return {
  placedTable: lib.blockAt(targetSpot.x, targetSpot.y, targetSpot.z)?.name,
  coalOres: coal.map(c => lib.fmt(c.position)),
  ironOres: iron.map(i => lib.fmt(i.position)),
  time: time,
  hostiles: lib.hostiles(16)
};
