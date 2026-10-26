// programs/546-extinguish-soul-fire-field.js
console.log('=== Program 546: Extinguish Soul Fire Field ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

bot.pathfinder.stop();
await sleep(50);

// Find all fire and soul_fire blocks within 8m
const fires = bot.findBlocks({
  matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
  maxDistance: 8,
  count: 20
});

console.log(`Found ${fires.length} fire blocks within reach.`);
let extinguished = 0;
for (const fp of fires) {
  try {
    const b = bot.blockAt(fp);
    if (b && (b.name === 'fire' || b.name === 'soul_fire')) {
      console.log(`Extinguishing fire at ${lib.fmt(fp)}...`);
      await bot.lookAt(fp.offset(0.5, 0.5, 0.5), true);
      await bot.dig(b);
      extinguished++;
      await sleep(100);
    }
  } catch (err) {
    console.log(`Error extinguishing ${lib.fmt(fp)}: ${err.message}`);
  }
}

console.log(`Extinguished ${extinguished} fire blocks!`);
bot.chat(`alpha: Extinguished ${extinguished} soul fire blocks near Nether portal! Trail secured!`);

// Check remaining fires
const remaining = bot.findBlocks({
  matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
  maxDistance: 8,
  count: 10
});
console.log(`Remaining fire blocks within 8m: ${remaining.length}`);
console.log('Alpha HP:', bot.health, 'Food:', bot.food);
