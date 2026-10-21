// programs/026-build-night-shelter.js
bot.chat("beta: Night in 45s! Enclosing in safe shelter at (32, 64, -45).")

console.log('alpha at:', lib.fmt(bot.entity.position))
const p = bot.entity.position.floored()
const targetFeet = p.offset(0, -1, 0)

// Dig 1 block down under feet
console.log('Digging under feet at:', lib.fmt(targetFeet))
await bot.dig(bot.blockAt(targetFeet), true)
await sleep(400)

// Walk into the hole
await bot.pathfinder.goto(new goals.GoalBlock(targetFeet.x, targetFeet.y, targetFeet.z))
console.log('In hole at:', lib.fmt(bot.entity.position))

const cur = bot.entity.position.floored()
const wallY = cur.y + 1
const roofY = cur.y + 2

// Place 4 sandstone walls around head at wallY
const walls = [
  { x: cur.x + 1, y: wallY, z: cur.z },
  { x: cur.x - 1, y: wallY, z: cur.z },
  { x: cur.x, y: wallY, z: cur.z + 1 },
  { x: cur.x, y: wallY, z: cur.z - 1 }
]

for (const w of walls) {
  if (lib.count('sandstone') > 0 && bot.blockAt(new Vec3(w.x, w.y, w.z))?.name === 'air') {
    try {
      console.log(`Placing wall at ${lib.fmt(w)}...`)
      await lib.place('sandstone', w.x, w.y, w.z)
    } catch (e) {
      console.log(`place wall at ${lib.fmt(w)} err:`, e.message)
    }
  }
}

// Place roof
const roof = { x: cur.x, y: roofY, z: cur.z }
if (bot.blockAt(new Vec3(roof.x, roof.y, roof.z))?.name === 'air') {
  const blockType = lib.count('sandstone') > 0 ? 'sandstone' : 'dirt'
  try {
    console.log(`Placing roof at ${lib.fmt(roof)}...`)
    await lib.place(blockType, roof.x, roof.y, roof.z)
  } catch (e) {
    console.log(`place roof err:`, e.message)
  }
}

console.log('Shelter complete! Status:')
return lib.status()
