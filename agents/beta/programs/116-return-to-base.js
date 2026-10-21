console.log('Returning to base at (294, 72, -54)...')
await lib.goTo(294, 72, -54, 2)
console.log('Arrived near base:', bot.entity.position)

// Go through door or enter
try {
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {
  console.log('Door note:', e.message)
}

console.log('Current position inside base:', bot.entity.position)
bot.chat('beta: Back at base! Checking chest for supplies.')

const contents = await lib.chestContents()
console.log('Base chest contents:', JSON.stringify(contents, null, 2))

// Withdraw pickaxe, sword, axe, armor, food
const toWithdraw = {}
if (contents.iron_leggings) toWithdraw.iron_leggings = contents.iron_leggings
if (contents.iron_chestplate) toWithdraw.iron_chestplate = 1
if (contents.iron_helmet) toWithdraw.iron_helmet = 1
if (contents.iron_boots) toWithdraw.iron_boots = 1
if (contents.shield) toWithdraw.shield = 1
if (contents.stone_pickaxe) toWithdraw.stone_pickaxe = Math.min(contents.stone_pickaxe, 2)
if (contents.iron_pickaxe) toWithdraw.iron_pickaxe = 1
if (contents.iron_sword) toWithdraw.iron_sword = 1
if (contents.cobblestone) toWithdraw.cobblestone = Math.min(contents.cobblestone, 64)
if (contents.cooked_beef) toWithdraw.cooked_beef = Math.min(contents.cooked_beef, 16)
if (contents.cooked_mutton) toWithdraw.cooked_mutton = Math.min(contents.cooked_mutton, 16)
if (contents.cooked_porkchop) toWithdraw.cooked_porkchop = Math.min(contents.cooked_porkchop, 16)
if (contents.bucket) toWithdraw.bucket = Math.min(contents.bucket, 2)
if (contents.water_bucket) toWithdraw.water_bucket = 1

console.log('Withdrawing:', toWithdraw)
await lib.withdraw(toWithdraw)

// Equip gear
try { await lib.equipArmor() } catch (e) {}

console.log('Inventory now:', JSON.stringify(lib.inv()))
return lib.inv()
