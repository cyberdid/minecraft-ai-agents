console.log('Dawn has arrived! Starting ascent to surface...')
bot.chat('beta: Dawn is here! Ascending to surface and running to base.')

// 1. Walk up exit path to surface at (350, 66, -30)
const movements = new Movements(bot, mcData)
movements.canDig = false
bot.pathfinder.setMovements(movements)

console.log('Pathing to surface (350, 66, -30)...')
await bot.pathfinder.goto(new goals.GoalNear(350, 66, -30, 1))
console.log('Surface reached at:', bot.entity.position)

// 2. Sprint to base door at (294, 72, -54)
console.log('Running to base door (294, 72, -54)...')
await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 2))
console.log('Arrived at base entrance:', bot.entity.position)

// 3. Enter base
try {
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {
  console.log('Door pass note:', e.message)
}

console.log('Inside base at:', bot.entity.position)
bot.chat('beta: Back inside base safe and sound!')

// 4. Set spawn at bed
try {
  const spawnRes = await lib.setSpawn()
  console.log('Spawn set:', spawnRes)
} catch (e) {
  console.log('Bed spawn note:', e.message)
}

// 5. Open chest and take supplies
const contents = await lib.chestContents()
console.log('Chest supplies:', JSON.stringify(contents, null, 2))

const toTake = {}
if (contents.iron_leggings) toTake.iron_leggings = 1
if (contents.iron_chestplate) toTake.iron_chestplate = 1
if (contents.iron_helmet) toTake.iron_helmet = 1
if (contents.iron_boots) toTake.iron_boots = 1
if (contents.shield) toTake.shield = 1
if (contents.iron_sword) toTake.iron_sword = 1
if (contents.stone_pickaxe) toTake.stone_pickaxe = Math.min(contents.stone_pickaxe, 2)
if (contents.iron_axe) toTake.iron_axe = 1
if (contents.iron_pickaxe) toTake.iron_pickaxe = 1
if (contents.cobblestone) toTake.cobblestone = Math.min(contents.cobblestone, 64)
if (contents.cooked_beef) toTake.cooked_beef = Math.min(contents.cooked_beef, 16)
if (contents.cooked_mutton) toTake.cooked_mutton = Math.min(contents.cooked_mutton, 16)
if (contents.cooked_porkchop) toTake.cooked_porkchop = Math.min(contents.cooked_porkchop, 16)
if (contents.bucket) toTake.bucket = Math.min(contents.bucket, 2)

console.log('Withdrawing:', toTake)
await lib.withdraw(toTake)

// 6. Equip armor
try {
  await lib.equipArmor()
} catch (e) {}

console.log('Beta re-armed! Inventory:', JSON.stringify(lib.inv()))
console.log('Gear equipped:', JSON.stringify(lib.tools()))
return { inventory: lib.inv(), tools: lib.tools() }
