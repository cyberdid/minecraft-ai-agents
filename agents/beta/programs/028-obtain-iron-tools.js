// 028-obtain-iron-tools.js - obtain iron_pickaxe, shield, iron_sword
bot.chat('beta: Morning Day 3! Heading out to obtain iron pickaxe, shield, and iron sword.')

console.log('Position before exiting base:', lib.fmt(bot.entity.position))
console.log('Time left in day:', lib.time().secondsUntilNight)

// Ensure door is open/exit through door
try {
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {
  console.log('Door passage note:', e.message)
}
console.log('Outside base at:', lib.fmt(bot.entity.position))

// 1. Obtain iron_pickaxe
console.log('Obtaining iron_pickaxe...')
try {
  const rPick = await lib.obtain('iron_pickaxe', 1)
  console.log('Iron pickaxe obtained! Steps:', rPick.steps.join(' -> '))
  bot.chat('beta: Acquired iron pickaxe!')
} catch (e) {
  console.log('Iron pickaxe obtain error:', e.message)
}

// 2. Obtain shield
console.log('Obtaining shield...')
try {
  const rShield = await lib.obtain('shield', 1)
  console.log('Shield obtained! Steps:', rShield.steps.join(' -> '))
  await lib.equipArmor()
  bot.chat('beta: Shield equipped in off-hand!')
} catch (e) {
  console.log('Shield obtain error:', e.message)
}

// 3. Obtain iron_sword
console.log('Obtaining iron_sword...')
try {
  const rSword = await lib.obtain('iron_sword', 1)
  console.log('Iron sword obtained! Steps:', rSword.steps.join(' -> '))
  bot.chat('beta: Acquired iron sword!')
} catch (e) {
  console.log('Iron sword obtain error:', e.message)
}

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Tools:', JSON.stringify(lib.tools()))
console.log('Time left:', lib.time().secondsUntilNight)

return { inv: lib.inv(), tools: lib.tools() }
