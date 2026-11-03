// programs/399-inspect-base-and-food.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Move inside base shelter
try {
  await lib.goTo(293, 72, -56, 1, { timeoutMs: 8000 });
} catch (e) {}

// 2. Inspect chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    console.log('Chest items:');
    for (const i of chest.containerItems()) {
      console.log(`  ${i.name} x${i.count}`);
      // Take iron, shields, weapons, food, coal
      if (i.name.includes('iron') || i.name.includes('shield') || i.name.includes('cooked') || i.name === 'bread' || i.name === 'apple' || i.name.includes('sword') || i.name.includes('pickaxe') || i.name === 'coal' || i.name.includes('planks') || i.name.includes('log')) {
        try { await chest.withdraw(i.type, null, i.count); } catch (e) {}
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// 3. Inspect furnaces at (295, 72, -54..-56)
for (const z of [-54, -55, -56]) {
  const fPos = new Vec3(295, 72, z);
  const fb = bot.blockAt(fPos);
  if (fb && fb.name.includes('furnace')) {
    try {
      const furnace = await bot.openFurnace(fb);
      console.log(`Furnace at ${lib.fmt(fPos)}:`);
      console.log('  input:', furnace.inputItem()?.name, furnace.inputItem()?.count);
      console.log('  fuel:', furnace.fuelItem()?.name, furnace.fuelItem()?.count);
      console.log('  output:', furnace.outputItem()?.name, furnace.outputItem()?.count);
      if (furnace.outputItem()) await furnace.takeOutput();
      furnace.close();
    } catch (e) {}
  }
}

// 4. Pickup any ground items
const p = await lib.pickup(8);
if (p > 0) console.log(`Picked up ${p} ground items.`);

// 5. Scan nearby animals on surface
const animals = Object.values(bot.entities).filter(e => ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) && e.position.distanceTo(bot.entity.position) < 40);
console.log(`Nearby animals within 40m (${animals.length}):`);
for (const a of animals) {
  console.log(`  ${a.name} at dist ${bot.entity.position.distanceTo(a.position).toFixed(1)}m`);
}

console.log('Current Delta inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
