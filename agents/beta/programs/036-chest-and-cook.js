// 036-chest-and-cook.js - inspect chest, smelt beef, eat, coordinate with alpha
console.log('Position before step up:', lib.fmt(bot.entity.position))

// Move up to floor at y=72
try {
  await lib.goTo(294, 72, -56, 1, { dig: false })
} catch (e) {
  console.log('Step up note:', e.message)
}
console.log('Base floor position:', lib.fmt(bot.entity.position))

// Check alpha
const alpha = bot.players.alpha
console.log('Alpha entity:', alpha?.entity ? lib.fmt(alpha.entity.position) : 'unknown')

// Inspect chest at (293, 72, -57)
const chest = await lib.chestContents(293, 72, -57)
console.log('Chest contents:', JSON.stringify(chest))

// Craft planks from birch_logs for fuel
if (lib.count('birch_log') > 0) {
  await lib.craft('birch_planks', lib.count('birch_log') * 4)
}

// Smelt beef in furnace at (295, 72, -55)
const beef = lib.count('beef')
if (beef > 0 && lib.count('birch_planks') >= 2) {
  console.log(`Smelting ${beef} beef in furnace...`)
  try {
    await lib.smelt('beef', 'birch_planks', beef)
    console.log('Beef cooked! cooked_beef count:', lib.count('cooked_beef'))
  } catch (e) {
    console.log('Smelt beef error:', e.message)
  }
}

// Eat cooked food
await lib.eat()
console.log('Food level after eating:', bot.food)

bot.chat(`beta: At base. Chest has ${JSON.stringify(chest)}. Cooked beef ready. Alpha, what is your iron count?`)

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time left in day:', lib.time().secondsUntilNight)
return { chest, inv: lib.inv(), time: lib.time() }
