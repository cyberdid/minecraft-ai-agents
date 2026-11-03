// programs/619-check-furnaces-and-drops.js
console.log('=== Program 619: Check Furnaces & Base Drops ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Check nearby dropped items (within 10m)
const drops = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 15);
console.log(`Found ${drops.length} dropped items nearby:`);
for (const d of drops) {
  const item = d.metadata ? d.metadata.find(m => m && m.itemId) : null;
  console.log(`- Drop at ${lib.fmt(d.position)} (dist ${bot.entity.position.distanceTo(d.position).toFixed(1)}m)`);
}

// Pickup nearby items
if (drops.length > 0) {
  console.log('Vacuuming nearby items...');
  try {
    const gained = await lib.pickup(10);
    console.log(`Picked up ${gained} items! Current inv:`, lib.inv());
  } catch (e) {
    console.log('Pickup error:', e.message);
  }
}

// 2. Check Furnaces at (295, 72, -54), (295, 72, -55), (295, 72, -56)
const furnaceCoords = [
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -56)
];

for (const fPos of furnaceCoords) {
  const fBlock = bot.blockAt(fPos);
  console.log(`Block at ${lib.fmt(fPos)}: ${fBlock?.name}`);
  if (fBlock && fBlock.name.includes('furnace')) {
    try {
      // Approach within 2 blocks
      if (bot.entity.position.distanceTo(fPos) > 2.5) {
        await lib.goTo(fPos.x - 1, fPos.y, fPos.z, 1, { timeoutMs: 3000 });
      }
      const furnace = await bot.openFurnace(fBlock);
      const inp = furnace.inputItem();
      const fuel = furnace.fuelItem();
      const out = furnace.outputItem();
      console.log(`Furnace at ${lib.fmt(fPos)} -> Input: ${inp ? inp.name + 'x' + inp.count : 'empty'}, Fuel: ${fuel ? fuel.name + 'x' + fuel.count : 'empty'}, Output: ${out ? out.name + 'x' + out.count : 'empty'}`);
      
      if (out) {
        console.log(`Taking output ${out.name} x${out.count}...`);
        await furnace.takeOutput();
      }
      furnace.close();
    } catch (e) {
      console.log(`Failed to open furnace at ${lib.fmt(fPos)}:`, e.message);
    }
  }
}

console.log('Final inventory:', lib.inv());
