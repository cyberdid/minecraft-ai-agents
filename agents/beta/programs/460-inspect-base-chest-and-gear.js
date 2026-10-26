// programs/460-inspect-base-chest-and-gear.js
console.log('=== Step: Inspect Base Chest & Furnaces for Gear & Food ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Inspect Chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
const cb = bot.blockAt(chestPos);
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('=== BASE CHEST CONTENTS ===');
    for (const it of items) {
      console.log(`  ${it.name} x${it.count}`);
    }
    chest.close();
  } catch (e) {
    console.log('Error opening chest:', e.message);
  }
} else {
  console.log('No block at chestPos!');
}

// 2. Inspect Furnaces at (295, 72, -54), (295, 72, -55), (295, 72, -56)
const furnacePositions = [
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -56)
];

for (const fp of furnacePositions) {
  const fb = bot.blockAt(fp);
  if (fb) {
    try {
      const f = await bot.openFurnace(fb);
      console.log(`Furnace at ${lib.fmt(fp)}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      f.close();
    } catch (e) {
      console.log(`Furnace ${lib.fmt(fp)} open error:`, e.message);
    }
  }
}

// 3. Check players in Overworld
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} in overworld at ${lib.fmt(p.entity.position)}`);
  }
}
