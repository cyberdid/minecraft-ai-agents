// programs/179-check-bucket-and-lava.js
console.log('--- Checking Bucket & Lava Pool ---');
console.log('Alpha pos:', lib.fmt(bot.entity.position));

// Check Beta
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p && p.entity) {
    console.log(`Beta is at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
  }
}

// Check base chest for iron or buckets
try {
  const chest = await lib.chestContents(293, 72, -57);
  console.log('Chest items:', JSON.stringify(chest));
} catch (e) {}

// Check 3 furnaces for iron
for (const c of [new Vec3(295, 72, -54), new Vec3(295, 72, -55), new Vec3(295, 72, -56)]) {
  const blk = bot.blockAt(c);
  if (blk && blk.name.includes('furnace')) {
    try {
      const furn = await bot.openFurnace(blk);
      console.log(`Furnace ${lib.fmt(c)}: in=${furn.inputItem()?.name}x${furn.inputItem()?.count}, out=${furn.outputItem()?.name}x${furn.outputItem()?.count}`);
      if (furn.outputItem()) await furn.takeOutput();
      furn.close();
    } catch (e) {}
  }
}

// Scan lava blocks near (333, 62, -78)
const lavaBlocks = bot.findBlocks({
  matching: b => b.name === 'lava',
  maxDistance: 64,
  count: 30
});
console.log(`Found ${lavaBlocks.length} lava blocks in loaded area.`);
for (const lb of lavaBlocks.slice(0, 5)) {
  const blk = bot.blockAt(lb);
  console.log(`  Lava at ${lib.fmt(lb)}, metadata=${blk?.metadata}`);
}

bot.chat('beta: Heading towards lava pool at (333, 62, -78) to assist with obsidian mining!');
