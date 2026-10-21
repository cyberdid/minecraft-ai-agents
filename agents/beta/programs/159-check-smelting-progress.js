const f1 = await bot.openFurnace(bot.blockAt(new Vec3(295, 72, -55)))
console.log('Furnace 1:', f1.inputItem()?.name, f1.fuelItem()?.name, f1.outputItem()?.name, f1.outputItem()?.count)
f1.close()

const f2 = await bot.openFurnace(bot.blockAt(new Vec3(295, 72, -54)))
console.log('Furnace 2:', f2.inputItem()?.name, f2.fuelItem()?.name, f2.outputItem()?.name, f2.outputItem()?.count)
f2.close()

const chest = await lib.chestContents()
console.log('Chest contents:', JSON.stringify(chest))

// Check Alpha's armor
const alpha = Object.values(bot.entities).find(e => e.username === 'alpha')
if (alpha) {
  console.log('Alpha equipment:', alpha.equipment?.map(e => e ? e.name : 'null'))
}
