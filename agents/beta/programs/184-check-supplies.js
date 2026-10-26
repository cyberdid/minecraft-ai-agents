console.log('=== Checking Chest & Furnaces ===')
const chest = await lib.chestContents()
console.log('Chest contents:', JSON.stringify(chest))

const furnaces = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
]
for (let i = 0; i < furnaces.length; i++) {
  const p = furnaces[i]
  const b = bot.blockAt(p)
  if (!b) continue
  const f = await bot.openFurnace(b)
  console.log(`Furnace ${i+1} at ${lib.fmt(p)}:`, {
    input: f.inputItem() ? `${f.inputItem().name} x${f.inputItem().count}` : 'empty',
    fuel: f.fuelItem() ? `${f.fuelItem().name} x${f.fuelItem().count}` : 'empty',
    output: f.outputItem() ? `${f.outputItem().name} x${f.outputItem().count}` : 'empty'
  })
  if (f.outputItem()?.count > 0) {
    console.log(`Taking ${f.outputItem().count} output from Furnace ${i+1}...`)
    await f.takeOutput()
  }
  f.close()
}

console.log('Beta inv now:', JSON.stringify(lib.inv()))
