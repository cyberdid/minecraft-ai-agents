const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  const chest = await bot.openChest(chestBlock);
  const items = chest.containerItems();
  console.log('CHEST CONTAINER ITEMS (' + items.length + '):');
  for (const i of items) {
    console.log(`  slot ${i.slot}: ${i.name} x${i.count}`);
  }
  await chest.close();
}

// Check 3 furnaces
for (const p of [new Vec3(295, 72, -55), new Vec3(295, 72, -54), new Vec3(295, 72, -56)]) {
  const fBlock = bot.blockAt(p);
  if (fBlock) {
    const f = await bot.openFurnace(fBlock);
    console.log(`Furnace at ${p.x},${p.y},${p.z}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
    await f.close();
  }
}
