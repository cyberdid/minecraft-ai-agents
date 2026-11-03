const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  const chest = await bot.openChest(chestBlock);
  console.log('Chest items:', chest.items().map(i => `${i.name} x${i.count}`).join(', '));
  await chest.close();
} else {
  console.log('Chest block not found');
}

// Furnaces
for (const pos of [new Vec3(295, 72, -55), new Vec3(295, 72, -54), new Vec3(295, 72, -56)]) {
  const fBlock = bot.blockAt(pos);
  if (fBlock) {
    const f = await bot.openFurnace(fBlock);
    console.log(`Furnace at ${pos}: input=${f.inputItem()?.name} x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name} x${f.fuelItem()?.count}, output=${f.outputItem()?.name} x${f.outputItem()?.count}`);
    await f.close();
  }
}
