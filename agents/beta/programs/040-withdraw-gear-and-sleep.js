// 040-withdraw-gear-and-sleep.js - withdraw iron gear from chest, equip shield/tools, sleep with alpha
console.log('Position inside base:', lib.fmt(bot.entity.position))
console.log('Time until night:', lib.time().secondsUntilNight)

// 1. Withdraw iron tools & shield from chest at (293, 72, -57)
console.log('Withdrawing iron tools and shield from chest...')
try {
  const chest = await lib.chestContents(293, 72, -57)
  console.log('Chest contents before withdraw:', JSON.stringify(chest))
  
  const want = {}
  if (chest.iron_pickaxe) want.iron_pickaxe = 1
  if (chest.iron_sword) want.iron_sword = 1
  if (chest.iron_axe) want.iron_axe = 1
  if (chest.shield) want.shield = 1
  
  if (Object.keys(want).length > 0) {
    await lib.withdraw(want, 293, 72, -57)
    console.log('Withdrawn:', JSON.stringify(want))
  }
} catch (e) {
  console.log('Chest withdraw error:', e.message)
}

// 2. Equip shield in off-hand and equip best weapon
console.log('Equipping armor & shield...')
try {
  const worn = await lib.equipArmor()
  console.log('Worn armor/shield:', JSON.stringify(worn))
} catch (e) {
  console.log('Equip armor note:', e.message)
}

await lib.equipWeapon()

// 3. Craft bucket with 3 of our 7 iron ingots!
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0) {
  console.log('Crafting bucket from iron ingots...')
  try {
    await lib.craft('bucket', 1)
    console.log('Bucket crafted!')
  } catch (e) {
    console.log('Bucket craft note:', e.message)
  }
}

// 4. Ensure door is closed
try {
  await lib.door(294, 72, -54, false)
} catch (e) {}

// 5. Check placed beds
const beds = lib.find('white_bed', { maxDistance: 16 })
console.log('Beds in base:', beds.map(b => lib.fmt(b.position)).join(', '))

// 6. Wait until tick 12542 and sleep
while (!isCancelled()) {
  const t = lib.time()
  console.log(`Current tick: ${t.timeOfDay} (${t.phase}) | canSleep: ${t.canSleep}`)
  if (t.canSleep) {
    console.log('Night reached! Sleeping in bed...')
    bot.chat('beta: Sleeping in bed now! Skipping night.')
    try {
      await lib.sleepInBed()
      console.log('Slept successfully!')
    } catch (e) {
      console.log('Sleep note:', e.message)
    }
    break
  }
  await sleep(3000)
}

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Tools:', JSON.stringify(lib.tools()))
console.log('Time:', lib.time())

return { tools: lib.tools(), inv: lib.inv(), time: lib.time() }
