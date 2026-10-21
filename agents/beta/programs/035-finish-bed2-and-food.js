// 035-finish-bed2-and-food.js - hunt remaining 2 sheep, get 16 dirt, hunt cows, craft and place Bed 2, cook food
console.log('Position:', lib.fmt(bot.entity.position))
console.log('Time left in day:', lib.time().secondsUntilNight)

// 1. Hunt sheep for 2 wool
console.log('Hunting sheep for remaining 2 wool...')
try {
  await lib.hunt('sheep', 2)
} catch (e) {
  console.log('Sheep hunt note:', e.message)
}

await lib.pickup(10)
console.log('Wool count now:', lib.count('*_wool'))

// 2. Ensure 16 dirt
if (lib.count('dirt') < 16) {
  console.log('Collecting dirt...')
  try {
    await lib.collect('dirt', 16 - lib.count('dirt'))
  } catch (e) {
    console.log('Dirt collect note:', e.message)
  }
}

// 3. Hunt cows for food
console.log('Hunting cows for food...')
try {
  await lib.hunt('cow', 3)
} catch (e) {
  console.log('Cow hunt note:', e.message)
}

await lib.pickup(10)

// 4. Return to base
console.log('Returning to base at (294, 72, -52)...')
await lib.goTo(294, 72, -52, 1)

// Open door, enter, close door
try {
  await lib.door(294, 72, -54, true)
  await lib.walkTo(294, -56)
  await lib.door(294, 72, -54, false)
} catch (e) {
  console.log('Door note:', e.message)
}
console.log('Inside base at:', lib.fmt(bot.entity.position))

// 5. Craft Bed 2 if we have 3 wool
if (lib.count('*_wool') >= 3 && lib.count('*_planks') >= 3) {
  console.log('Crafting Bed 2...')
  try {
    await lib.craft('white_bed', 1)
    console.log('Bed 2 crafted!')
    
    // Place Bed 2 at (294, 72, -56)
    try {
      await lib.place('white_bed', 294, 72, -56)
      console.log('Bed 2 successfully placed at (294, 72, -56)!')
      bot.chat('beta: Milestone 4 complete! Bed 2 is placed in base. Both players have beds!')
    } catch (pe) {
      console.log('Bed 2 place note:', pe.message)
    }
  } catch (ce) {
    console.log('Bed 2 craft note:', ce.message)
  }
}

// 6. Smelt any raw meat in furnace at (295, 72, -55)
const beef = lib.count('beef')
const mutton = lib.count('mutton')
if (beef > 0 || mutton > 0) {
  console.log(`Cooking meat (beef: ${beef}, mutton: ${mutton})...`)
  if (beef > 0) {
    try { await lib.smelt('beef', 'oak_planks', beef) } catch (e) {}
  }
  if (mutton > 0) {
    try { await lib.smelt('mutton', 'oak_planks', mutton) } catch (e) {}
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time left in day:', lib.time().secondsUntilNight)

return lib.inv()
