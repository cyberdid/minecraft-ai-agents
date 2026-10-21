console.log('Digging 2 blocks to surface ceiling...')
console.log('Digging (348, 65, -32)...')
await lib.dig(348, 65, -32)

console.log('Digging (348, 66, -32)...')
await lib.dig(348, 66, -32)

console.log('Surface hole opened! Moving to surface (348, 67, -32)...')
const movements = new Movements(bot, mcData)
movements.canDig = true
bot.pathfinder.setMovements(movements)

try {
  await bot.pathfinder.goto(new goals.GoalNear(348, 67, -32, 1))
} catch (e) {
  console.log('Move to surface note:', e.message)
}

console.log('Surface position:', bot.entity.position)
bot.chat('beta: Surface reached! Running to base.')

// Run to base door (294, 72, -54)
console.log('Running to base door...')
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 2))
  console.log('Arrived at base entrance:', bot.entity.position)
  await lib.goThroughDoor(294, 72, -54)
  console.log('Inside base at:', bot.entity.position)
} catch (e) {
  console.log('Base travel note:', e.message)
}

bot.chat('beta: Safely inside base! Re-arming from chest.')

// Set spawn at nearest bed
try {
  const spawnRes = await lib.setSpawn()
  console.log('Spawn set:', spawnRes)
} catch (e) {
  console.log('Bed note:', e.message)
}

// Open chest and take supplies
const contents = await lib.chestContents()
console.log('Base chest contents:', JSON.stringify(contents, null, 2))

const toTake = {}
if (contents.iron_leggings) toTake.iron_leggings = 1
if (contents.iron_chestplate) toTake.iron_chestplate = 1
if (contents.iron_helmet) toTake.iron_helmet = 1
if (contents.iron_boots) toTake.iron_boots = 1
if (contents.shield) toTake.shield = 1
if (contents.iron_sword) toTake.iron_sword = 1
if (contents.stone_pickaxe) toTake.stone_pickaxe = Math.min(contents.stone_pickaxe, 2)
if (contents.iron_pickaxe) toTake.iron_pickaxe = 1
if (contents.iron_axe) toTake.iron_axe = 1
if (contents.cobblestone) toTake.cobblestone = Math.min(contents.cobblestone, 64)
if (contents.cooked_beef) toTake.cooked_beef = Math.min(contents.cooked_beef, 16)
if (contents.cooked_mutton) toTake.cooked_mutton = Math.min(contents.cooked_mutton, 16)
if (contents.cooked_porkchop) toTake.cooked_porkchop = Math.min(contents.cooked_porkchop, 16)
if (contents.bucket) toTake.bucket = Math.min(contents.bucket, 2)

console.log('Withdrawing:', toTake)
await lib.withdraw(toTake)

// Equip armor and weapons
try { await lib.equipArmor() } catch (e) {}
try { await lib.equipWeapon() } catch (e) {}

console.log('Beta re-armed!')
console.log('Inventory:', JSON.stringify(lib.inv()))
console.log('Tools:', JSON.stringify(lib.tools()))
return { inventory: lib.inv(), tools: lib.tools() }
