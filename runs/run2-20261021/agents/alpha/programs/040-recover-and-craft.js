// programs/040-recover-and-craft.js
console.log('alpha at:', lib.fmt(bot.entity.position))

// Walk around the quarry area to pick up any dropped sandstone/sand
const spots = [
  { x: 6, y: 64, z: -26 },
  { x: 5, y: 64, z: -25 },
  { x: 2, y: 65, z: -27 },
  { x: 7, y: 65, z: -28 }
]

for (const s of spots) {
  try {
    await lib.goTo(s.x, s.y, s.z, 1)
    await lib.pickup(6)
  } catch (e) {
    console.log(`pickup at ${lib.fmt(s)} err:`, e.message)
  }
}

await lib.stowCursor()
await lib.clearCraftingGrid()

console.log('Inventory after pickup:', JSON.stringify(lib.inv()))

// Now craft sandstone in safe small steps of 4 at a time
while (lib.count('sand') >= 4) {
  const countToCraft = Math.min(4, Math.floor(lib.count('sand') / 4))
  if (countToCraft <= 0) break
  console.log(`Crafting batch of ${countToCraft} sandstone (sand: ${lib.count('sand')})...`)
  try {
    await lib.craft('sandstone', countToCraft)
  } catch (err) {
    console.log('batch craft err:', err.message)
    await lib.stowCursor()
    await lib.clearCraftingGrid()
    break
  }
}

console.log('Sandstone count now:', lib.count('sandstone'))
console.log('Inventory now:', JSON.stringify(lib.inv()))

return lib.status()
