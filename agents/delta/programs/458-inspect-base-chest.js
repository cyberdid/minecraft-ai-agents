globalThis.isProgramCancelled = isCancelled;

console.log("Delta pos:", lib.fmt(bot.entity.position));

// Check base chest
try {
  await bot.pathfinder.goto(new goals.GoalNear(293, 72, -57, 2));
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    const chest = await bot.openChest(chestBlock);
    const items = chest.items().map(i => `${i.name} x${i.count}`);
    console.log("Chest contents:", items.join(', '));
    chest.close();
  }
} catch (e) {
  console.log("Chest error:", e.message);
}

// Check furnace
for (const fpos of [new Vec3(295, 72, -55), new Vec3(295, 72, -54), new Vec3(295, 72, -56)]) {
  const fb = bot.blockAt(fpos);
  if (fb && fb.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fb);
      console.log(`Furnace at ${lib.fmt(fpos)}: input=${f.inputItem()?.name} x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name} x${f.fuelItem()?.count}, output=${f.outputItem()?.name} x${f.outputItem()?.count}`);
      f.close();
    } catch (e) {}
  }
}

return { inv: lib.inv() };
