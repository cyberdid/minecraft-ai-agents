// programs/280-inspect-base-and-craft-shield.js
console.log('=== INSPECT BASE CHEST, FURNACES & CRAFT SHIELD ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Inspect Chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);
if (chestBlock && chestBlock.name.includes('chest')) {
  console.log('Opening chest at (293, 72, -57)...');
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.items();
    console.log(`Chest items (${items.length}):`, items.map(i => `${i.name}x${i.count}`).join(', '));
    await chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
} else {
  console.log('No chest at (293, 72, -57), block is:', chestBlock ? chestBlock.name : 'null');
}

// 2. Inspect Furnaces at (295, 72, -54), (295, 72, -55), (295, 72, -56)
const furnaceCoords = [
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -56)
];

for (const fPos of furnaceCoords) {
  const fBlock = bot.blockAt(fPos);
  if (fBlock && fBlock.name.includes('furnace')) {
    try {
      const furnace = await bot.openFurnace(fBlock);
      console.log(`Furnace at ${lib.fmt(fPos)}: input=${furnace.inputItem()?.name}x${furnace.inputItem()?.count || 0}, fuel=${furnace.fuelItem()?.name}x${furnace.fuelItem()?.count || 0}, output=${furnace.outputItem()?.name}x${furnace.outputItem()?.count || 0}`);
      await furnace.close();
    } catch (e) {
      console.log(`Furnace at ${lib.fmt(fPos)} error:`, e.message);
    }
  }
}

// 3. Check ground inside base for any dropped items
const itemsNear = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 8);
console.log(`Dropped items inside base (${itemsNear.length}):`);
for (const it of itemsNear) {
  console.log(`  - ${lib.fmt(it.position)} dist=${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}
try {
  await lib.pickup(6);
  await lib.equipArmor();
} catch (e) {}

// 4. Report inventory
console.log('Current Inventory:', JSON.stringify(lib.inv()));
