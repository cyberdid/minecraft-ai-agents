// 027-iron-mining.js - obtain iron tools, shield, bucket at start of Day 3
console.log('Starting Day 3 iron acquisition...')
console.log('Current time:', lib.time())

// Check hostiles outside door first
const hostiles = lib.hostiles(16)
console.log('Hostiles near door:', JSON.stringify(hostiles))

bot.chat('beta: Starting iron mining and tool crafting for Milestone 2!')

// Ensure we have stone pickaxe with good durability
if (lib.count('stone_pickaxe') === 0) {
  console.log('Obtaining stone_pickaxe...')
  await lib.obtain('stone_pickaxe', 1)
}

// Obtain iron_pickaxe
console.log('Obtaining iron_pickaxe...')
try {
  const rPick = await lib.obtain('iron_pickaxe', 1)
  console.log('Iron pickaxe obtained! Steps:', rPick.steps.join(' -> '))
  bot.chat('beta: Acquired iron pickaxe!')
} catch (e) {
  console.log('Iron pickaxe obtain note:', e.message)
}

// Obtain shield
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1) {
  console.log('Crafting shield...')
  try {
    await lib.craft('shield', 1)
    await lib.equipArmor()
    console.log('Shield equipped!')
  } catch (e) {
    console.log('Shield error:', e.message)
  }
}

// Obtain bucket
if (lib.count('bucket') === 0 && lib.count('iron_ingot') >= 3) {
  console.log('Crafting bucket...')
  try {
    await lib.craft('bucket', 1)
  } catch (e) {
    console.log('Bucket craft note:', e.message)
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Tools:', JSON.stringify(lib.tools()))
console.log('Time left in day:', lib.time().secondsUntilNight)

return lib.inv()
