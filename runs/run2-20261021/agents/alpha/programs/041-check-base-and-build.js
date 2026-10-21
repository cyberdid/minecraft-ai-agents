// programs/041-check-base-and-build.js
bot.chat("beta: Welcome back! I have 28 sandstone for walls. Building at (10, 67, -25) now.")

console.log('alpha at:', lib.fmt(bot.entity.position))

// Go to the shared chest at (9, 67, -23)
await lib.goTo(9, 67, -23, 2, { dig: true })
console.log('At chest/table location:', lib.fmt(bot.entity.position))

// Check chest contents
try {
  const contents = await lib.chestContents(9, 67, -23)
  console.log('Shared chest contents:', JSON.stringify(contents))
  if (contents.sandstone) {
    console.log(`Withdrawing ${contents.sandstone} sandstone from chest...`)
    await lib.withdraw({ sandstone: 'all' }, 9, 67, -23)
  }
} catch (e) {
  console.log('chest err:', e.message)
}

// Get the agreed blueprint
const blueprint = globalThis.getBlueprint ? globalThis.getBlueprint(lib) : lib.shapes.house({
  x: 10, y: 67, z: -25,
  width: 5, depth: 5, height: 3,
  wall: 'sandstone',
  roof: 'oak_planks',
  door: 'south',
  windows: true
})

console.log('Materials status before build:', JSON.stringify(lib.materials(blueprint)))

// Build with replace: false (or true if grass/sand is in the way)
console.log('Executing lib.build...')
const report = await lib.build(blueprint, { replace: true })
console.log('Build report:', JSON.stringify(report))

console.log('Materials status after build:', JSON.stringify(lib.materials(blueprint)))
console.log('Inventory now:', JSON.stringify(lib.inv()))

// Announce progress
const mat = lib.materials(blueprint)
bot.chat(`alpha: Placed sandstone walls! Need: ${JSON.stringify(mat.need)}`)

return lib.status()
