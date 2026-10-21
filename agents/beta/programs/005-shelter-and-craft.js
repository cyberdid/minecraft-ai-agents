// 005-shelter-and-craft.js - shelter for the night and craft base components
const t = lib.time()
console.log('Time before shelter:', t)

bot.chat(`beta: Night approaching (${t.secondsUntilNight}s). Entering shelter at ${lib.fmt(bot.entity.position)}.`)

// Shelter safely
try {
  await lib.shelter()
  console.log('Successfully sheltered at', lib.fmt(bot.entity.position))
} catch (e) {
  console.log('Shelter error:', e.message)
}

// Craft planks from logs
const logs = lib.count('*_log')
if (logs > 0) {
  const logKey = Object.keys(lib.inv()).find(k => k.endsWith('_log'))
  const plankKey = logKey.replace('_log', '_planks')
  console.log(`Crafting planks from ${logs} logs...`)
  await lib.craft(plankKey, logs * 4)
}

// Craft door
if (lib.count('*_door') === 0 && lib.count('*_planks') >= 6) {
  console.log('Crafting door...')
  await lib.craft('oak_door', 3)
}

// Craft chest
if (lib.count('chest') === 0 && lib.count('*_planks') >= 8) {
  console.log('Crafting chest...')
  await lib.craft('chest', 1)
}

console.log('Inventory inside shelter:', JSON.stringify(lib.inv()))
console.log('Time now:', lib.time())

const alpha = bot.players.alpha
console.log('Alpha pos:', alpha?.entity?.position ? lib.fmt(alpha.entity.position) : 'unknown')
