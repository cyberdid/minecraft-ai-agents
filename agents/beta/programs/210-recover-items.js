console.log('=== Item Recovery Mission ===')
bot.chat('beta: Died to skeleton at (362, -25, -70). Recovering items now!')

// 1. Take cobblestone from chest for bridging / blocking
try {
  await lib.withdraw({ cobblestone: 32 })
  console.log('Withdrew 32 cobblestone from chest')
} catch (e) {
  console.log('Withdraw note:', e.message)
}

// 2. Craft stone sword if sticks available
try {
  if (lib.count('stick') >= 1 && lib.count('cobblestone') >= 2) {
    await lib.craft('stone_sword', 1)
    await lib.equipWeapon()
  }
} catch (e) {}

// 3. Exit base
try {
  await lib.goThroughDoor(294, 72, -54)
  console.log('Outside base door:', lib.fmt(bot.entity.position))
} catch (e) {
  console.log('Door exit note:', e.message)
}

// 4. Move to staircase top at (311, 65, -65)
console.log('Walking to staircase top (311, 65, -65)...')
await lib.goTo(311, 65, -65, 2, { timeoutMs: 25000 })
console.log('At staircase top:', lib.fmt(bot.entity.position))

// 5. Descend down the staircase to death spot at (362, -25, -70)
console.log('Descending staircase to death spot (362, -25, -70)...')
await lib.goTo(362, -25, -70, 2, { timeoutMs: 45000 })
console.log('At death spot! Beta at:', lib.fmt(bot.entity.position))

// 6. Pickup items
const picked = await lib.pickup(12)
console.log(`Picked up items!`)

// 7. Equip recovered gear
try {
  await lib.equipArmor()
  await lib.equipWeapon()
} catch (e) {}

// 8. Fight off skeleton if nearby
const nearbyHostiles = lib.hostiles(8)
if (nearbyHostiles.length > 0) {
  console.log('Fighting hostiles at death spot:', JSON.stringify(nearbyHostiles))
  try {
    await lib.fight(8, 15)
  } catch (e) {
    console.log('Fight note:', e.message)
  }
}

// 9. Pick up remaining items
await lib.pickup(10)
console.log('Recovered inventory:', JSON.stringify(lib.inv()))
console.log('Recovered gear:', JSON.stringify(lib.tools()))

bot.chat(`beta: Recovered gear! Iron pickaxe: ${lib.count('iron_pickaxe')}, flint_and_steel: ${lib.count('flint_and_steel')}.`)
