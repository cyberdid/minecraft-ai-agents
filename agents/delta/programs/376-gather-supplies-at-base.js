// programs/376-gather-supplies-at-base.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Check furnaces
const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const p of furnacePositions) {
  const b = bot.blockAt(p);
  if (b && (b.name === 'furnace' || b.name === 'smoker' || b.name === 'blast_furnace')) {
    console.log(`Checking ${b.name} at ${lib.fmt(p)}:`);
    try {
      const furnace = await bot.openFurnace(b);
      console.log('  input:', furnace.inputItem() ? `${furnace.inputItem().name} x${furnace.inputItem().count}` : 'none');
      console.log('  fuel:', furnace.fuelItem() ? `${furnace.fuelItem().name} x${furnace.fuelItem().count}` : 'none');
      console.log('  output:', furnace.outputItem() ? `${furnace.outputItem().name} x${furnace.outputItem().count}` : 'none');
      if (furnace.outputItem()) {
        await furnace.takeOutput();
      }
      furnace.close();
    } catch (e) {
      console.log(`  Failed: ${e.message}`);
    }
  }
}

// 2. Go pick up the ground items near (297, 65, -52) and (302, 67, -52)
const targets = [
  new Vec3(297, 65, -52),
  new Vec3(302, 67, -52),
  new Vec3(306, 67, -62)
];

for (const t of targets) {
  try {
    console.log(`Moving to target ${lib.fmt(t)}...`);
    await lib.goTo(t.x, t.y, t.z, 2, { timeoutMs: 8000 });
    const p = await lib.pickup(5);
    console.log(`Picked up ${p} items.`);
  } catch (e) {
    console.log(`Pickup at ${lib.fmt(t)} note: ${e.message}`);
  }
}

// 3. Return to base shelter
await lib.goTo(293, 72, -56, 1, { timeoutMs: 8000 });

console.log('Current inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
