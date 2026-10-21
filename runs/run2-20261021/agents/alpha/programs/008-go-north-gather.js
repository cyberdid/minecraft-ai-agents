// programs/008-go-north-gather.js
bot.chat("alpha: Heading North to z=-55 for wood and dirt.")

console.log('Moving towards (0, -55)...')
await lib.goToXZ(0, -55)
console.log('Arrived at:', lib.fmt(bot.entity.position))

// Check what is nearby
const dirtBlocks = bot.findBlocks({ matching: mcData.blocksByName.dirt.id, maxDistance: 16, count: 20 })
console.log('dirt blocks nearby:', dirtBlocks.length)

// Collect 16 dirt first (essential for safety and leveling)
if (dirtBlocks.length > 0) {
  console.log('Collecting dirt...')
  const gainedDirt = await lib.collect('dirt', 16)
  console.log('gained dirt:', JSON.stringify(gainedDirt))
}

// Check surface logs nearby
const nearbyLogs = lib.find('*_log', { maxDistance: 32, count: 5 })
console.log('logs nearby:', nearbyLogs.length)
if (nearbyLogs.length > 0) {
  console.log('nearest log at:', lib.fmt(nearbyLogs[0].position))
}

console.log('Inventory now:', JSON.stringify(lib.inv()))
return lib.status()
