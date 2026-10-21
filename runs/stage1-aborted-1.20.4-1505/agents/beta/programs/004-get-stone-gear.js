// programs/004-get-stone-gear.js
bot.chat('beta: gathering wood, dirt, and digging down to stone for tools.')

const surfacePos = bot.entity.position.clone()
console.log('Surface position:', lib.fmt(surfacePos))

// 1. Logs
console.log('Collecting logs...')
await lib.collect('*_log', 10)
const inv1 = lib.inv()
console.log('Logs collected. Inventory:', JSON.stringify(inv1))

// 2. Dirt
console.log('Collecting dirt...')
await lib.collect('dirt', 16)
console.log('Dirt collected:', lib.count('dirt'))

// 3. Craft planks and sticks
const logName = Object.keys(lib.inv()).find(k => k.endsWith('_log'))
const plankName = logName ? logName.replace('_log', '_planks') : 'dark_oak_planks'
await lib.craft(plankName, 24)
await lib.craft('stick', 12)
console.log('Planks & sticks crafted. Planks:', lib.count(plankName), 'Sticks:', lib.count('stick'))

// 4. Descend to y=50 where stone is
console.log('Descending to y=50 to reach stone layer...')
await lib.descend(50)
console.log('Reached depth. Current position:', lib.fmt(bot.entity.position))

// 5. Collect stone
console.log('Collecting 20 stone...')
await lib.collect('stone', 20)
console.log('Cobblestone count:', lib.count('cobblestone'))

// 6. Ensure crafting table & craft stone tools and furnace
await lib.ensureTable()
await lib.craft('stone_pickaxe', 1)
await lib.craft('stone_axe', 1)
await lib.craft('stone_sword', 1)
await lib.craft('furnace', 1)
console.log('Stone tools crafted!')

// 7. Walk back to surface
console.log('Returning to surface at:', lib.fmt(surfacePos))
try {
  await lib.goTo(surfacePos.x, surfacePos.y, surfacePos.z, 2)
} catch (e) {
  console.log('goTo surface error, trying goToXZ:', e.message)
  await lib.goToXZ(surfacePos.x, surfacePos.z)
}

const status = lib.status()
bot.chat(`beta: stone tools & furnace ready! Night in ${status.secondsUntilNight}s. Location: ${lib.fmt(status.pos)}`)

return {
  tools: lib.tools(),
  inv: lib.inv(),
  pos: lib.fmt(status.pos),
  secondsUntilNight: status.secondsUntilNight
}
