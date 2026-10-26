// programs/181-get-3rd-iron-craft-bucket-fill-water.js
console.log('--- Crafting Water Bucket & Going to Lava Pool ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Iron ingots:', lib.count('iron_ingot'));

// 1. Check furnace for 3rd iron ingot
for (const c of [new Vec3(295, 72, -55), new Vec3(295, 72, -54)]) {
  const blk = bot.blockAt(c);
  if (blk && blk.name.includes('furnace')) {
    try {
      const furn = await bot.openFurnace(blk);
      if (furn.outputItem()) {
        console.log(`Taking ${furn.outputItem().name}x${furn.outputItem().count} from furnace...`);
        await furn.takeOutput();
      }
      furn.close();
    } catch (e) {}
  }
}

console.log('Iron ingots in inventory:', lib.count('iron_ingot'));

// 2. Craft bucket
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0 && lib.count('water_bucket') === 0) {
  console.log('Crafting bucket...');
  try {
    await lib.craft('bucket', 1);
    console.log('Bucket crafted!');
  } catch (e) {
    console.log('Craft bucket error:', e.message);
  }
}

// 3. Fill bucket with water
if (lib.count('bucket') > 0 && lib.count('water_bucket') === 0) {
  console.log('Filling bucket with water...');
  try {
    const res = await lib.fillBucket('water');
    console.log('fillBucket result:', res);
  } catch (e) {
    console.log('fillBucket error:', e.message);
  }
}

console.log('Alpha inventory:', JSON.stringify(lib.inv()));

// 4. If we have water_bucket (or bucket), go to lava pool at (333, 62, -78)
console.log('Going to lava pool at (333, 62, -78)...');
bot.chat('beta: Coming to lava pool at (333, 62, -78) right now!');

try {
  await lib.goTo(333, 63, -78, 3);
  console.log('Arrived at lava pool! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Approach error:', e.message);
  await lib.goToXZ(333, -78);
}

// 5. Inspect lava blocks at pool
const lavaBlocks = bot.findBlocks({
  matching: b => b.name === 'lava' || b.name === 'obsidian',
  maxDistance: 16,
  count: 30
});
console.log(`Found ${lavaBlocks.length} lava/obsidian blocks at pool:`);
for (const lb of lavaBlocks.slice(0, 5)) {
  console.log(`  ${bot.blockAt(lb).name} at ${lib.fmt(lb)}`);
}

// 6. If holding water_bucket, place water next to lava source
if (lib.count('water_bucket') > 0) {
  const lavaSource = bot.findBlock({
    matching: b => b.name === 'lava' && b.metadata === 0,
    maxDistance: 8
  });
  if (lavaSource) {
    console.log('Found lava source at:', lib.fmt(lavaSource.position));
    // Place water on solid block adjacent to lava (e.g. y+1 or side)
    const placeSpot = lavaSource.position.offset(0, 1, 0);
    const solidNeighbor = lavaSource.position.offset(-1, 1, 0);
    console.log('Pouring water to quench lava into obsidian...');
    try {
      await bot.equip(mcData.itemsByName.water_bucket.id, 'hand');
      await bot.lookAt(solidNeighbor);
      bot.activateItem();
      await sleep(1500);
      // Pick water back up
      bot.activateItem();
      console.log('Water poured and scooped back!');
    } catch (e) {
      console.log('Water pour error:', e.message);
    }
  }
}

// Check obsidian formed
const obsidianBlocks = bot.findBlocks({
  matching: b => b.name === 'obsidian',
  maxDistance: 16,
  count: 20
});
console.log(`Obsidian blocks at pool: ${obsidianBlocks.length}`);
bot.chat(`beta: Obsidian available at pool: ${obsidianBlocks.length}! Mine 10 with diamond_pickaxe!`);
