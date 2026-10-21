// 043-hunt-food-and-wool.js - chop fuel, cook current meat, hunt food & wool for Bed 2, stockpile food
console.log('Position:', lib.fmt(bot.entity.position))
console.log('Time left in day:', lib.time().secondsUntilNight)

// 1. Collect 2 logs for furnace fuel
console.log('Collecting 2 logs for fuel...')
try {
  await lib.collect('*_log', 2)
  const logKey = Object.keys(lib.inv()).find(k => k.endsWith('_log'))
  if (logKey) await lib.craft(logKey.replace('_log', '_planks'), 8)
} catch (e) {
  console.log('Log collect note:', e.message)
}

// 2. Cook current beef & mutton in furnace at (295, 72, -55)
try {
  const beef = lib.count('beef')
  const mutton = lib.count('mutton')
  if (beef > 0) await lib.smelt('beef', 'oak_planks', beef)
  if (mutton > 0) await lib.smelt('mutton', 'oak_planks', mutton)
} catch (e) {
  console.log('Current meat cook note:', e.message)
}

// Eat to full hunger
await lib.eat()
console.log('Food level now:', bot.food)

// 3. Hunt animals for food and wool (Milestones 4 and 5)
bot.chat('beta: Hunting animals for food stockpile (ML 5) and wool for Bed 2 (ML 4).')

// Hunt sheep
console.log('Hunting sheep...')
try {
  await lib.hunt('sheep', 2)
} catch (e) {
  console.log('Sheep hunt note:', e.message)
}

// Hunt cows / pigs
console.log('Hunting cows/pigs...')
try {
  await lib.hunt('cow', 3)
} catch (e) {
  try {
    await lib.hunt('pig', 3)
  } catch (pe) {
    console.log('Pig hunt note:', pe.message)
  }
}

await lib.pickup(10)

// 4. Return to base
console.log('Returning to base at (294, 72, -52)...')
await lib.goTo(294, 72, -52, 1)
try {
  await lib.door(294, 72, -54, true)
  await lib.walkTo(294, -56)
  await lib.door(294, 72, -54, false)
} catch (e) {}

// 5. Craft Bed 2 if 3 wool
const wool = lib.count('*_wool')
console.log('Wool count in base:', wool)
if (wool >= 3) {
  try {
    await lib.craft('white_bed', 1)
    await lib.place('white_bed', 294, 72, -56)
    console.log('Bed 2 placed at (294, 72, -56)!')
    bot.chat('beta: Milestone 4 complete! Both players have beds placed in base.')
  } catch (e) {
    console.log('Bed 2 place note:', e.message)
  }
}

// 6. Smelt all remaining raw meat
const rawMeat = lib.count('beef') + lib.count('mutton') + lib.count('porkchop')
console.log(`Cooking ${rawMeat} raw meat in furnace...`)
if (rawMeat > 0 && lib.count('*_planks') >= 2) {
  if (lib.count('beef') > 0) try { await lib.smelt('beef', 'oak_planks', lib.count('beef')) } catch (e) {}
  if (lib.count('mutton') > 0) try { await lib.smelt('mutton', 'oak_planks', lib.count('mutton')) } catch (e) {}
  if (lib.count('porkchop') > 0) try { await lib.smelt('porkchop', 'oak_planks', lib.count('porkchop')) } catch (e) {}
}

const cookedFood = lib.count('cooked_beef') + lib.count('cooked_mutton') + lib.count('cooked_porkchop')
console.log(`Total cooked food in inventory: ${cookedFood}`)
console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time left in day:', lib.time().secondsUntilNight)

bot.chat(`beta: Have ${cookedFood} cooked food and water bucket.`)
return lib.inv()
