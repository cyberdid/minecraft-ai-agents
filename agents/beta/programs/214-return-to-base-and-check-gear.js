console.log('=== Return to Base & Re-arm ===')

// 1. Walk into base
await lib.goTo(294, 72, -53, 1)
try {
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {}
console.log('Inside base at:', lib.fmt(bot.entity.position))

// 2. Withdraw weapons & food from chest
console.log('Checking chest...')
const chest = await lib.chestContents()
console.log('Chest:', JSON.stringify(chest))

const withdrawItems = {}
if (chest['stone_sword']) withdrawItems.stone_sword = 1
if (chest['stone_pickaxe']) withdrawItems.stone_pickaxe = 1
if (chest['cooked_beef']) withdrawItems.cooked_beef = 1
if (chest['iron_ingot']) withdrawItems.iron_ingot = chest['iron_ingot']

if (Object.keys(withdrawItems).length > 0) {
  try {
    await lib.withdraw(withdrawItems)
    console.log('Withdrew items:', JSON.stringify(withdrawItems))
  } catch (e) {
    console.log('Withdraw note:', e.message)
  }
}

// 3. Equip weapons
await lib.equipWeapon()

// 4. Eat food if hunger < 20
if (lib.count('cooked_beef') > 0 && bot.food < 20) {
  try {
    await bot.equip(mcData.itemsByName.cooked_beef.id, 'hand')
    await bot.consume()
  } catch (e) {}
}

// 5. Check Alpha
const alpha = bot.players.alpha
if (alpha && alpha.entity) {
  console.log(`Alpha at: ${lib.fmt(alpha.entity.position)}`)
}

bot.chat('beta: Back in base, re-armed with stone tools. Let us complete the Nether portal!')
console.log('Beta inv:', JSON.stringify(lib.inv()))
console.log('Beta tools:', JSON.stringify(lib.tools()))
