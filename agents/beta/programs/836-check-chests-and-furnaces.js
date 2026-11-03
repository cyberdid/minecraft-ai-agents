// programs/836-check-chests-and-furnaces.js
console.log('=== Program 836: Check Base Chest & Furnaces ===');
globalThis.isProgramCancelled = isCancelled;

const chestPos = new Vec3(293, 72, -57);
console.log(`Checking chest at ${lib.fmt(chestPos)}...`);

try {
  const chestBlock = bot.blockAt(chestPos);
  if (chestBlock) {
    const chest = await bot.openContainer(chestBlock);
    console.log('Chest items:');
    const items = chest.containerItems();
    if (items.length === 0) {
      console.log('  (empty)');
    } else {
      for (const it of items) {
        console.log(`  ${it.name} x${it.count}`);
      }
    }
    await chest.close();
  } else {
    console.log('Chest block not found at (293, 72, -57)');
  }
} catch (e) {
  console.log(`Error reading chest: ${e.message}`);
}

// Check nearby furnaces
const furnaces = bot.findBlocks({
  matching: b => b && (b.name === 'furnace' || b.name === 'blast_furnace' || b.name === 'smoker'),
  maxDistance: 16,
  count: 10
});
console.log(`Found ${furnaces.length} furnaces near base:`, furnaces.map(f => lib.fmt(f)));

// Chat to coordinate
bot.chat('Beta: I hold water_bucket and empty bucket. Checking base chest for lava/obsidian.');
