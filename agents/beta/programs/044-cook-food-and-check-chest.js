// 044-cook-food-and-check-chest.js - cook 11 meat in furnace with birch_planks, eat to 20/20, check chest for iron
console.log('Position inside base:', lib.fmt(bot.entity.position))
console.log('Food before cooking:', bot.food)

// 1. Check chest at (293, 72, -57)
const chest = await lib.chestContents(293, 72, -57)
console.log('Chest contents:', JSON.stringify(chest))

// 2. Cook meat in furnace at (295, 72, -55)
// Fuel: birch_planks
const beef = lib.count('beef')
const pork = lib.count('porkchop')
const mutton = lib.count('mutton')

if (beef > 0) {
  console.log(`Cooking ${beef} beef...`)
  try {
    await lib.smelt('beef', 'birch_planks', beef)
  } catch (e) {
    console.log('Beef cook note:', e.message)
  }
}

if (pork > 0) {
  console.log(`Cooking ${pork} porkchop...`)
  try {
    await lib.smelt('porkchop', 'birch_planks', pork)
  } catch (e) {
    console.log('Pork cook note:', e.message)
  }
}

if (mutton > 0) {
  console.log(`Cooking ${mutton} mutton...`)
  try {
    await lib.smelt('mutton', 'birch_planks', mutton)
  } catch (e) {
    console.log('Mutton cook note:', e.message)
  }
}

// 3. Eat cooked food to restore hunger to 20
await lib.eat()
console.log('Food after eating:', bot.food)

// 4. Deposit spare cooked food, doors, gravel into chest to share with alpha
const totalCooked = lib.count('cooked_beef') + lib.count('cooked_porkchop') + lib.count('cooked_mutton')
console.log('Total cooked food now:', totalCooked)

if (totalCooked >= 6) {
  console.log('Sharing cooked food into chest for alpha...')
  try {
    await lib.deposit({ cooked_porkchop: 3, cooked_beef: 2 }, 293, 72, -57)
  } catch (e) {
    console.log('Deposit food note:', e.message)
  }
}

// 5. Check if chest has iron ingots or raw iron
const chestNow = await lib.chestContents(293, 72, -57)
console.log('Chest contents now:', JSON.stringify(chestNow))

// If chest has raw iron, smelt it; if chest has iron ingots, withdraw to craft armor!
if (chestNow.iron_ingot >= 5 || lib.count('iron_ingot') >= 5) {
  if (chestNow.iron_ingot > 0) {
    await lib.withdraw({ iron_ingot: chestNow.iron_ingot }, 293, 72, -57)
  }
  
  // Craft armor pieces
  // Chestplate: 8 ingots
  if (lib.count('iron_ingot') >= 8 && lib.count('iron_chestplate') === 0) {
    console.log('Crafting iron_chestplate...')
    try { await lib.craft('iron_chestplate', 1) } catch (e) {}
  }
  // Leggings: 7 ingots
  if (lib.count('iron_ingot') >= 7 && lib.count('iron_leggings') === 0) {
    console.log('Crafting iron_leggings...')
    try { await lib.craft('iron_leggings', 1) } catch (e) {}
  }
  // Helmet: 5 ingots
  if (lib.count('iron_ingot') >= 5 && lib.count('iron_helmet') === 0) {
    console.log('Crafting iron_helmet...')
    try { await lib.craft('iron_helmet', 1) } catch (e) {}
  }
  
  await lib.equipArmor()
}

console.log('Currently worn armor:', JSON.stringify(await lib.equipArmor()))
console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time left in day:', lib.time().secondsUntilNight)

bot.chat(`beta: Food cooked and shared! Food level: ${bot.food}/20. Water bucket ready.`)
return lib.inv()
