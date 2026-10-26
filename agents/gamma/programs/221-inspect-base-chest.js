// programs/221-inspect-base-chest.js
console.log('=== INSPECT BASE STORAGE & INVENTORY ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Open and inspect chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    console.log('\n--- CHEST AT (293, 72, -57) ITEMS ---');
    const items = chest.items();
    for (const item of items) {
      console.log(` - ${item.name} x${item.count}`);
    }
    await chest.close();
  } catch (e) {
    console.log('Chest open error:', e.message);
  }
} else {
  console.log('No chest block found at (293, 72, -57)!');
}

// 2. Inspect furnaces
const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];
for (const fp of furnacePositions) {
  const fb = bot.blockAt(fp);
  if (fb && fb.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fb);
      console.log(`\nFurnace at ${lib.fmt(fp)}: input=${f.inputItem()?.name}x${f.inputItem()?.count} fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count} output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      await f.close();
    } catch (e) {
      console.log(`Furnace at ${lib.fmt(fp)} open error:`, e.message);
    }
  }
}

// 3. Check players in Overworld
console.log('\n--- PLAYERS ---');
for (const p of Object.values(bot.players)) {
  const ent = p.entity;
  console.log(`${p.username}: ${ent ? `${lib.fmt(ent.position)} held=${ent.heldItem?.name || 'none'}` : 'far/other dimension'}`);
}
