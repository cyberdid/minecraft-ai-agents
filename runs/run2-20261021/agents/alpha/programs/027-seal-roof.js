// programs/027-seal-roof.js
// Place a block at (33, 65, -45) to create a solid neighbor, then place the roof over head at (32, 65, -45)

console.log('alpha at:', lib.fmt(bot.entity.position))

// Check blocks surrounding head (y=64)
const cur = bot.entity.position.floored() // (32, 63, -45)
console.log('head is at:', lib.fmt(cur.offset(0, 1, 0)))

// Place block on top of (33, 64, -45) -> (33, 65, -45)
try {
  console.log('Placing block at (33, 65, -45)...')
  await lib.place('sandstone', 33, 65, -45)
} catch (e) {
  console.log('err 33,65,-45:', e.message)
}

// Now place roof at (32, 65, -45)
try {
  console.log('Placing roof at (32, 65, -45)...')
  await lib.place('sandstone', 32, 65, -45)
} catch (e) {
  console.log('err 32,65,-45:', e.message)
}

// Verify shelter enclosure:
const head = cur.offset(0, 1, 0)
const roof = cur.offset(0, 2, 0)
console.log('Roof block:', bot.blockAt(roof)?.name)
for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
  const side = head.offset(dx, 0, dz)
  console.log(`Side (${dx}, ${dz}) at ${lib.fmt(side)}: ${bot.blockAt(side)?.name}`)
}

return lib.status()
