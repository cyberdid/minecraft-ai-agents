console.log('=== INSPECT ALL 3 FURNACES INSIDE BASE ===');

// Step through door into base
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door error:', e.message);
}

// Stand right in front of furnaces at (294, 72, -55)
try {
  await bot.pathfinder.goto(new goals.GoalNear(294.0, 72.0, -55.0, 0.5));
} catch (e) {}

console.log('Standing at:', lib.fmt(bot.entity.position));

const furnacePositions = [
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -56)
];

for (const p of furnacePositions) {
  const fBlock = bot.blockAt(p);
  if (fBlock) {
    try {
      const f = await bot.openFurnace(fBlock);
      const input = f.inputItem();
      const fuel = f.fuelItem();
      const output = f.outputItem();
      console.log(`Furnace at ${lib.fmt(p)}: input=${input?.name}x${input?.count}, fuel=${fuel?.name}x${fuel?.count}, output=${output?.name}x${output?.count}`);
      
      // If output is iron_ingot or gold_ingot, withdraw it!
      if (output && output.count > 0) {
        console.log(`Taking ${output.count} ${output.name} from furnace at ${lib.fmt(p)}...`);
        await f.takeOutput();
      }
      await f.close();
    } catch (err) {
      console.log(`Furnace at ${lib.fmt(p)} error:`, err.message);
    }
  } else {
    console.log(`Furnace at ${lib.fmt(p)} not found`);
  }
}

console.log('Delta inventory after checking furnaces:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

return { inv: lib.inv() };
