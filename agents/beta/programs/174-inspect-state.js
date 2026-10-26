console.log('=== Status & Base Inspection ===')
console.log('Position:', lib.fmt(bot.entity.position))
console.log('Time:', JSON.stringify(lib.time()))
console.log('Health:', bot.health, 'Food:', bot.food)
console.log('Beta inv:', JSON.stringify(lib.inv()))

const chest = await lib.chestContents().catch(e => e.message)
console.log('Chest:', JSON.stringify(chest))

const furnaces = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
]
for (const p of furnaces) {
  const b = bot.blockAt(p)
  if (b && (b.name === 'furnace' || b.name === 'lit_furnace')) {
    try {
      const f = await bot.openFurnace(b)
      console.log(`Furnace at ${lib.fmt(p)}:`, {
        input: f.inputItem() ? `${f.inputItem().name} x${f.inputItem().count}` : 'empty',
        fuel: f.fuelItem() ? `${f.fuelItem().name} x${f.fuelItem().count}` : 'empty',
        output: f.outputItem() ? `${f.outputItem().name} x${f.outputItem().count}` : 'empty'
      })
      if (f.outputItem()) {
        await f.takeOutput()
        console.log(`Took output from furnace at ${lib.fmt(p)}`)
      }
      f.close()
    } catch (err) {
      console.log(`Furnace at ${lib.fmt(p)} error:`, err.message)
    }
  }
}

const alpha = bot.players.alpha
if (alpha && alpha.entity) {
  console.log('Alpha at:', lib.fmt(alpha.entity.position))
} else {
  console.log('Alpha entity not loaded in view')
}
