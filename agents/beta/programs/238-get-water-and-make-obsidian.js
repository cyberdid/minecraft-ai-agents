console.log('=== Get Water Bucket & Make Obsidian ===')

// 1. Return to base to get water_bucket
await lib.goTo(294, 72, -53, 1, { timeoutMs: 25000 })
try {
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {}
console.log('Inside base at:', lib.fmt(bot.entity.position))

bot.chat('alpha: Please toss the water_bucket or put it in the chest! I have the diamond pickaxe ready for obsidian.')

// Check for tossed items
await sleep(3000)
await lib.pickup(4)

// Check chest
const chest = await lib.chestContents()
console.log('Chest:', JSON.stringify(chest))

if (chest['water_bucket'] > 0) {
  console.log('Withdrawing water_bucket from chest...')
  await lib.withdraw({ water_bucket: 1 })
}

console.log('Beta water_bucket count:', lib.count('water_bucket'))

// 2. If we have water_bucket, make obsidian at lava pool
if (lib.count('water_bucket') > 0 && lib.count('diamond_pickaxe') > 0) {
  bot.chat('beta: Water bucket in hand! Proceeding to make 10 obsidian at the lava pool.')
  try {
    await lib.goThroughDoor(294, 72, -54)
  } catch (e) {}
  
  console.log('Moving to lava pool (333, 64, -78)...')
  await lib.goTo(333, 64, -78, 2, { timeoutMs: 30000 })
  console.log('At lava pool! Starting lib.makeObsidian(10)...')
  
  try {
    const res = await lib.makeObsidian(10)
    console.log('makeObsidian result:', JSON.stringify(res))
    bot.chat(`beta: Mined obsidian! Obsidian count: ${lib.count('obsidian')}.`)
  } catch (e) {
    console.log('makeObsidian error:', e.message)
    bot.chat(`beta: Obsidian note: ${e.message}`)
  }
}

console.log('Obsidian on beta:', lib.count('obsidian'))
console.log('Beta inv:', JSON.stringify(lib.inv()))
console.log('Beta tools:', JSON.stringify(lib.tools()))
