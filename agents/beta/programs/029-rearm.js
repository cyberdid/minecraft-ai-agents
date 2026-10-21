// 029-rearm.js - rearm with stone tools, dirt, and food
bot.chat('beta: Re-arming on surface with logs, stone tools, dirt, and food.')

console.log('Position:', lib.fmt(bot.entity.position))

// Ascend to y=72 and step outside through door
try {
  await lib.goTo(294, 72, -52, 1, { dig: true })
} catch (e) {
  console.log('Step to door note:', e.message)
}
console.log('Outside at:', lib.fmt(bot.entity.position))

// 1. Collect 8 logs
console.log('Collecting logs...')
const logs = await lib.collect('*_log', 8)
console.log('Collected logs:', JSON.stringify(logs))

// 2. Craft planks
const logKey = Object.keys(lib.inv()).find(k => k.endsWith('_log')) || 'oak_log'
const plankKey = logKey.replace('_log', '_planks')
await lib.craft(plankKey, 16)
await lib.craft('stick', 8)
await lib.craft('wooden_pickaxe', 1)

// 3. Collect cobblestone
console.log('Collecting stone...')
await lib.collect('stone', 16)
console.log('Cobblestone count:', lib.count('cobblestone'))

// 4. Craft stone tools
await lib.craft('stone_pickaxe', 1)
await lib.craft('stone_sword', 1)
await lib.craft('stone_axe', 1)

// 5. Collect dirt for emergency safety
if (lib.count('dirt') < 16) {
  console.log('Collecting dirt...')
  await lib.collect('dirt', 16 - lib.count('dirt'))
}

// 6. Hunt animal for food
console.log('Hunting cow/pig for food...')
const cow = bot.nearestEntity(e => e.name === 'cow')
const pig = bot.nearestEntity(e => e.name === 'pig')
const target = cow || pig
if (target && target.position.distanceTo(bot.entity.position) < 48) {
  try {
    await lib.hunt(target.name, 2)
  } catch (e) {
    console.log('Hunt note:', e.message)
  }
}

await lib.pickup(10)

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Tools:', JSON.stringify(lib.tools()))
console.log('Time left in day:', lib.time().secondsUntilNight)

bot.chat(`beta: Re-armed with stone tools, ${lib.count('dirt')} dirt, and food. Ready for safe iron mining.`)
return lib.inv()
