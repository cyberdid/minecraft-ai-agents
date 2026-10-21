const f1 = await bot.openFurnace(bot.blockAt(new Vec3(295, 72, -55)))
console.log('Furnace 1:', f1.inputItem(), f1.fuelItem(), f1.outputItem())
f1.close()

const f2 = await bot.openFurnace(bot.blockAt(new Vec3(295, 72, -54)))
console.log('Furnace 2:', f2.inputItem(), f2.fuelItem(), f2.outputItem())
f2.close()

const f3 = await bot.openFurnace(bot.blockAt(new Vec3(295, 72, -56)))
console.log('Furnace 3:', f3.inputItem(), f3.fuelItem(), f3.outputItem())
f3.close()
