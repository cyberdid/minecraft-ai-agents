console.log('Heading straight to base (294, 72, -54) from', bot.entity.position)
await lib.goTo(294, 72, -54, 2)
console.log('Arrived at base entrance:', bot.entity.position)

// Go through door into base
try {
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {
  console.log('Door passage note:', e.message)
}

console.log('Inside base:', bot.entity.position)
bot.chat('beta: Safely inside base! Re-equipping from chest.')

// Set spawn at nearest bed
try {
  const spawnRes = await lib.setSpawn()
  console.log('Spawn set:', spawnRes)
} catch (e) {
  console.log('Bed note:', e.message)
}

// Inspect chest and take what Alpha prepared
const chest = await lib.chestContents()
console.log('Chest supplies:', JSON.stringify(chest, null, 2))

const toTake = {}
if (chest.iron_leggings) toTake.iron_leggings = 1
if (chest.iron_chestplate) toTake.iron_chestplate = 1
if (chest.iron_helmet) toTake.iron_helmet = 1
if (chest.iron_boots) toTake.iron_boots = 1
if (chest.shield) toTake.shield = 1
if (chest.iron_sword) toTake.iron_sword = 1
if (chest.stone_pickaxe) toTake.stone_pickaxe = Math.min(chest.stone_pickaxe, 2)
if (chest.iron_axe) toTake.iron_axe = 1
if (chest.cobblestone) toTake.cobblestone = Math.min(chest.cobblestone, 64)
if (chest.cooked_beef) toTake.cooked_beef = Math.min(chest.cooked_beef, 16)
if (chest.cooked_mutton) toTake.cooked_mutton = Math.min(chest.cooked_mutton, 16)
if (chest.cooked_porkchop) toTake.cooked_porkchop = Math.min(chest.cooked_porkchop, 16)

console.log('Withdrawing:', toTake)
await lib.withdraw(toTake)
await lib.equipArmor()

console.log('Current inventory:', JSON.stringify(lib.inv()))
console.log('Tools:', JSON.stringify(lib.tools()))
