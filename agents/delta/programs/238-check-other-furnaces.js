// programs/238-check-other-furnaces.js
const furnacePos2 = new Vec3(295, 72, -54);
const furnacePos3 = new Vec3(295, 72, -56);

for (const pos of [furnacePos2, furnacePos3]) {
  const b = bot.blockAt(pos);
  if (b) {
    try {
      const f = await bot.openFurnace(b);
      console.log(`Furnace at ${lib.fmt(pos)}: in=${f.inputItem()?.name} fuel=${f.fuelItem()?.name} out=${f.outputItem()?.name} x${f.outputItem()?.count}`);
      if (f.outputItem()) {
        await f.takeOutput();
        console.log(`Took output ${f.outputItem()?.name}!`);
      }
      await f.close();
    } catch (e) {
      console.log(`Furnace ${lib.fmt(pos)} error:`, e.message);
    }
  }
}
