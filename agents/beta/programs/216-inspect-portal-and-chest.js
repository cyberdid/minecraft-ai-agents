console.log('=== Inspect Portal, Furnaces & Supplies ===')

// 1. Inspect portal site at (298, 72, -54)
console.log('Portal site blocks:')
for (let dx = 0; dx < 4; dx++) {
  for (let dy = 0; dy < 5; dy++) {
    const p = new Vec3(298 + dx, 72 + dy, -54)
    const b = bot.blockAt(p)
    if (b && b.name !== 'air') {
      console.log(`  (${p.x}, ${p.y}, ${p.z}): ${b.name}`)
    }
  }
}

// 2. Check chest
const chest = await lib.chestContents()
console.log('Chest:', JSON.stringify(chest))

// 3. Check all 3 furnaces
const furnaces = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
]
for (let i = 0; i < furnaces.length; i++) {
  const p = furnaces[i]
  const b = bot.blockAt(p)
  if (!b) continue
  try {
    const f = await bot.openFurnace(b)
    console.log(`Furnace ${i+1} at ${lib.fmt(p)}:`, {
      input: f.inputItem() ? `${f.inputItem().name} x${f.inputItem().count}` : 'empty',
      fuel: f.fuelItem() ? `${f.fuelItem().name} x${f.fuelItem().count}` : 'empty',
      output: f.outputItem() ? `${f.outputItem().name} x${f.outputItem().count}` : 'empty'
    })
    if (f.outputItem()) {
      await f.takeOutput()
      console.log(`Took ${f.outputItem().count} ${f.outputItem().name} from Furnace ${i+1}`)
    }
    f.close()
  } catch (e) {
    console.log(`Furnace ${i+1} note:`, e.message)
  }
}

// 4. Check Alpha
const alpha = bot.players.alpha
if (alpha && alpha.entity) {
  console.log(`Alpha at: ${lib.fmt(alpha.entity.position)}`)
}

console.log('Beta inv now:', JSON.stringify(lib.inv()))
