// 023-solidify-floor-and-bed.js - enter base, seal y=71 floor holes with dirt/cobblestone, place bed solidly, set spawn
console.log('Position:', lib.fmt(bot.entity.position))

// 1. Move to base door at (294, 72, -52)
console.log('Moving to base door...')
await lib.goTo(294, 72, -52, 1, { dig: true })

// 2. Open door and step inside
try {
  await lib.door(294, 72, -54, true)
  await lib.walkTo(294, -56)
  await lib.door(294, 72, -54, false)
} catch (e) {
  console.log('Door passage note:', e.message)
}
console.log('Inside base at:', lib.fmt(bot.entity.position))

// 3. Scan and patch floor holes at y=71
console.log('Scanning and patching floor at y=71...')
for (let x = 293; x <= 295; x++) {
  for (let z = -57; z <= -55; z++) {
    const f = lib.blockAt(x, 71, z)
    if (!f || f.boundingBox !== 'block') {
      console.log(`Hole at floor (${x}, 71, ${z}): ${f?.name}. Patching with dirt/cobblestone...`)
      try {
        const material = lib.count('cobblestone') > 0 ? 'cobblestone' : 'dirt'
        await lib.place(material, x, 71, z)
        console.log(`Patched (${x}, 71, ${z}) with ${material}`)
      } catch (e) {
        console.log(`Failed to patch (${x}, 71, ${z}):`, e.message)
      }
    }
  }
}

// 4. Place bed on solid floor
if (lib.count('white_bed') > 0) {
  console.log('Placing white_bed...')
  try {
    await lib.place('white_bed', 294, 72, -56)
    console.log('Bed placed successfully at (294, 72, -56)!')
  } catch (e) {
    console.log('Bed placement error:', e.message)
    // Try adjacent spot
    try {
      await lib.place('white_bed', 293, 72, -56)
      console.log('Bed placed at (293, 72, -56)!')
    } catch (e2) {
      console.log('Second bed spot error:', e2.message)
    }
  }
}

// 5. Verify placed bed and set spawn
const placedBeds = lib.find('white_bed', { maxDistance: 10 })
console.log('Found placed beds:', placedBeds.map(b => lib.fmt(b.position)).join(', '))

if (placedBeds.length > 0) {
  try {
    await lib.setSpawn()
    console.log('SPAWN SUCCESSFULLY SET!')
    bot.chat('alpha: Floor sealed and bed placed! Right click bed to set spawn.')
  } catch (e) {
    console.log('Set spawn error:', e.message)
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time left in day:', lib.time().secondsUntilNight)
return lib.inv()
