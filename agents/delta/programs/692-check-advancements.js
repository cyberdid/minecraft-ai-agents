console.log('=== PROGRAM 692: CHECK ADVANCEMENTS & PLAYER STATS ===');

// Check what items are in all players' inventories
console.log('--- Nearby Players ---');
for (const p of Object.values(bot.entities).filter(e => e.type === 'player')) {
  console.log(`- ${p.username}: pos=${lib.fmt(p.position)}, held=${p.heldItem ? p.heldItem.name : 'null'}`);
}

// Check furnace inventories in base
const fPositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -57),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const fp of fPositions) {
  const b = bot.blockAt(fp);
  if (b && b.name.includes('furnace')) {
    try {
      const fn = await bot.openFurnace(b);
      console.log(`Furnace at ${lib.fmt(fp)}:`);
      console.log(`  input: ${fn.inputItem() ? `${fn.inputItem().name} x${fn.inputItem().count}` : 'empty'}`);
      console.log(`  fuel: ${fn.fuelItem() ? `${fn.fuelItem().name} x${fn.fuelItem().count}` : 'empty'}`);
      console.log(`  output: ${fn.outputItem() ? `${fn.outputItem().name} x${fn.outputItem().count}` : 'empty'}`);
      fn.close();
    } catch (e) {
      console.log(`Furnace at ${lib.fmt(fp)} error:`, e.message);
    }
  }
}

// Ask in chat
bot.chat('delta: Status query: who holds blaze_powder or blaze_rod? It is not in Base Chest.');
