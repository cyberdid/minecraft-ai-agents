// 020-alpha-recovery.js - assist alpha after drowning, deposit starter gear into chest
const alpha = bot.players.alpha
console.log('Alpha status:', alpha?.entity ? lib.fmt(alpha.entity.position) : 'no entity yet')

bot.chat('alpha: I saw you drowned! Bed is placed and spawn set in base. I left food and tools in chest. Where are your dropped items?')

// Deposit starter gear into chest at (293, 72, -57) for alpha
console.log('Depositing food and tools into chest for alpha...')
try {
  await lib.deposit({ cooked_mutton: 2, cooked_beef: 1, stone_sword: 1 }, 293, 72, -57)
  console.log('Deposited emergency supplies for alpha')
} catch (e) {
  console.log('Deposit note:', e.message)
}

// Check chest contents
const chest = await lib.chestContents(293, 72, -57)
console.log('Chest now has:', JSON.stringify(chest))

// Check where alpha is or if we can see death items nearby
console.log('Checking nearby items...')
const count = await lib.pickup(16)
console.log('Picked up nearby items count:', count)

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time left:', lib.time().secondsUntilNight)
