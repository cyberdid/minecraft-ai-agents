// programs/411-inspect-door-and-shaft-entrance.js
console.log('=== Step: Inspect door and walk to main shaft entrance ===');
console.log('Current pos:', lib.fmt(bot.entity.position));

const door = bot.blockAt(new Vec3(294, 72, -54));
if (door) {
  console.log(`Door at (294, 72, -54): type=${door.name}, open=${door._properties?.open}`);
  if (!door._properties?.open) {
    await bot.activateBlock(door);
    console.log('Opened door!');
    await sleep(400);
  }
}

// Step through door to (294, 72, -52)
try {
  await lib.goTo(294, 72, -52, 1);
  console.log('Stepped through door to', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Step note:', e.message);
}

// Close door behind
if (door && door._properties?.open) {
  try {
    await bot.activateBlock(door);
    console.log('Closed door behind!');
  } catch (e) {}
}

// Move to main shaft entrance (302, 71, -44)
try {
  console.log('Navigating to shaft entrance at (302, 71, -44)...');
  await lib.goTo(302, 71, -44, 1.5);
  console.log('Arrived at shaft entrance! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Shaft entrance nav note:', e.message);
}

// Scan for iron ore within 15 blocks of shaft entrance
const ores = bot.findBlocks({
  matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
  maxDistance: 15,
  count: 10
});
console.log(`Iron ore found near shaft entrance: ${ores.length}`);
for (const p of ores) {
  console.log(`  Iron ore at ${lib.fmt(p)}`);
}

bot.chat(`beta: At shaft entrance ${lib.fmt(bot.entity.position)}. Descending main shaft stairs to mine iron!`);
