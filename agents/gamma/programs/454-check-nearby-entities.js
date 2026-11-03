// programs/454-check-nearby-entities.js
console.log('=== CHECK NEARBY ENTITIES & CROPS ===');

// Check animals
const animals = Object.values(bot.entities)
  .filter(e => e.position && ['cow', 'pig', 'sheep', 'chicken'].includes(e.name))
  .map(e => `${e.name} at ${lib.fmt(e.position)} (dist: ${bot.entity.position.distanceTo(e.position).toFixed(1)}m)`);
console.log('Animals nearby:', animals.join(', ') || 'none');

// Check crops or berry bushes
const crops = bot.findBlocks({
  matching: b => b && (b.name === 'wheat' || b.name === 'carrots' || b.name === 'potatoes' || b.name === 'sweet_berry_bush'),
  maxDistance: 24,
  count: 10
});
console.log('Crops found count:', crops.length);
for (const cp of crops) {
  const b = bot.blockAt(cp);
  console.log(`- ${b.name} at ${lib.fmt(cp)} (metadata/age: ${b.metadata})`);
}

// Check furnace at (286, 72, -62)
try {
  const fblock = bot.blockAt(new Vec3(286, 72, -62));
  if (fblock) {
    const f = await bot.openFurnace(fblock);
    console.log(`Furnace (286, 72, -62): in: ${f.inputItem()?.name}, fuel: ${f.fuelItem()?.name}, out: ${f.outputItem()?.name} x${f.outputItem()?.count}`);
    f.close();
  }
} catch (e) {
  console.log('Furnace 286 error:', e.message);
}
