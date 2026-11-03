// programs/618-inspect-base-and-rearm.js
console.log('=== Program 618: Inspect Base & Rearm ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Inspect Chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);
console.log('Chest block at', lib.fmt(chestPos), 'type:', chestBlock?.name);

if (chestBlock && chestBlock.name.includes('chest')) {
  try {
    const chest = await bot.openContainer(chestBlock);
    console.log('--- CHEST ITEMS ---');
    const items = chest.containerItems();
    if (items.length === 0) {
      console.log('Chest is empty!');
    } else {
      for (const item of items) {
        console.log(`- ${item.name} x${item.count} (slot ${item.slot})`);
      }
    }
    chest.close();
  } catch (err) {
    console.log('Failed to open chest:', err.message);
  }
}

// 2. Inspect Furnaces at (295, 72, -54..-56)
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
      console.log(`--- FURNACE AT ${lib.fmt(fPos)} ---`);
      console.log('Input:', furnace.inputItem() ? `${furnace.inputItem().name} x${furnace.inputItem().count}` : 'empty');
      console.log('Fuel:', furnace.fuelItem() ? `${furnace.fuelItem().name} x${furnace.fuelItem().count}` : 'empty');
      console.log('Output:', furnace.outputItem() ? `${furnace.outputItem().name} x${furnace.outputItem().count}` : 'empty');
      furnace.close();
    } catch (e) {
      console.log(`Failed to open furnace at ${lib.fmt(fPos)}:`, e.message);
    }
  }
}

// 3. Check surrounding dropped items and blocks inside base
const drops = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 10);
console.log('--- DROPS IN BASE ---', drops.length);
for (const d of drops) {
  console.log(`Drop: dist ${bot.entity.position.distanceTo(d.position).toFixed(1)}m at ${lib.fmt(d.position)}`);
}

// 4. Check players online and positions
for (const pName of Object.keys(bot.players)) {
  const p = bot.players[pName];
  if (p && p.entity) {
    console.log(`Player ${pName} at ${lib.fmt(p.entity.position)}`);
  } else {
    console.log(`Player ${pName} not in render distance`);
  }
}
