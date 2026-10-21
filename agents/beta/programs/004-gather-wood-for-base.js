// 004-gather-wood-for-base.js - gather logs for roof, door, chest, and get dirt
bot.chat('beta: gathering wood for roof, door, and chest now.')

console.log('Position:', lib.fmt(bot.entity.position))
console.log('Time until night:', lib.time().secondsUntilNight)

// Ascend to surface if needed
if (bot.entity.position.y < 71) {
  await lib.goTo(292, 72, -58, 2, { dig: true })
}

// Check dirt
if (lib.count('dirt') < 16) {
  const needed = 16 - lib.count('dirt')
  console.log(`Collecting ${needed} dirt...`)
  await lib.collect('dirt', needed)
}

// Collect 10-12 logs
console.log('Collecting logs...')
const gotLogs = await lib.collect('*_log', 10)
console.log('Collected logs:', JSON.stringify(gotLogs))

// Craft planks from logs
const totalLogs = lib.count('*_log')
if (totalLogs > 0) {
  const logItem = Object.keys(lib.inv()).find(k => k.endsWith('_log'))
  const plankName = logItem.replace('_log', '_planks')
  await lib.craft(plankName, totalLogs * 4)
}

// Craft door and chest if we don't have them
if (lib.count('*_door') === 0 && lib.count('*_planks') >= 6) {
  await lib.craft('oak_door', 3)
}
if (lib.count('chest') === 0 && lib.count('*_planks') >= 8) {
  await lib.craft('chest', 1)
}

console.log('Inventory now:', JSON.stringify(lib.inv()))
const t = lib.time()
console.log('Time left until night:', t.secondsUntilNight)
bot.chat(`beta: ready with ${lib.count('*_planks')} planks, door, chest. Night in ${t.secondsUntilNight}s.`)

return lib.inv()
