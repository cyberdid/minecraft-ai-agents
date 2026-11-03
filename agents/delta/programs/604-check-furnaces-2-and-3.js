for (const p of [new Vec3(295, 72, -54), new Vec3(295, 72, -56)]) {
  const fBlock = bot.blockAt(p);
  if (fBlock) {
    try {
      const f = await bot.openFurnace(fBlock);
      console.log(`Furnace at ${p.x},${p.y},${p.z}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      await f.close();
    } catch (e) {
      console.log(`Error reading furnace at ${p.x},${p.y},${p.z}:`, e.message);
    }
  }
}
