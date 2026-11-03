// programs/679-inspect-resources-for-milestone9.js
console.log('=== Program 679: Inspect Resources for Milestone 9 (Ender Pearls) ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    console.log('Base Chest:');
    const items = chest.containerItems();
    for (const item of items) {
      console.log(` - ${item.name} x ${item.count}`);
    }
    await chest.close();
  } catch (e) {
    console.log('Error opening chest:', e.message);
  }
}

// Check nearby furnaces
const furnaces = bot.findBlocks({ matching: b => b && (b.name === 'furnace' || b.name === 'blast_furnace'), maxDistance: 8 });
console.log(`Found ${furnaces.length} furnaces:`);
for (const fp of furnaces) {
  const fb = bot.blockAt(fp);
  console.log(` Furnace at ${lib.fmt(fp)}: ${fb?.name}`);
}

console.log('Alpha inv:', lib.inv());
bot.chat('alpha: Milestone 8 secured! Initiating Milestone 9: Gathering 12+ Ender Pearls!');
