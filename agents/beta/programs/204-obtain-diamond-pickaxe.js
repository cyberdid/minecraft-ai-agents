console.log('=== Obtaining Diamond Pickaxe ===')

// 1. Exit base through door
try {
  await lib.goThroughDoor(294, 72, -54)
  console.log('Stepped outside. Beta at:', lib.fmt(bot.entity.position))
} catch (e) {
  console.log('Door exit note:', e.message)
}

// 2. Move to east hill at (311, 65, -65) to avoid aquifer at x < 300
console.log('Moving to east hill (311, 65, -65)...')
await lib.goTo(311, 65, -65, 2, { timeoutMs: 40000 })
console.log('Arrived on solid ground at:', lib.fmt(bot.entity.position))

bot.chat('beta: At east hill (311, 65, -65). Starting lib.obtain for diamond_pickaxe!')

// 3. Obtain diamond pickaxe
console.log('Calling lib.obtain("diamond_pickaxe", 1)...')
const res = await lib.obtain('diamond_pickaxe', 1)
console.log('Obtain completed successfully!')
if (res.steps) {
  console.log('Steps:\n' + res.steps.join('\n'))
}

console.log('Beta diamond_pickaxe count:', lib.count('diamond_pickaxe'))
if (lib.count('diamond_pickaxe') > 0) {
  bot.chat('Milestone 6 COMPLETE: Beta crafted a diamond_pickaxe!')
}

console.log('Beta tools:', JSON.stringify(lib.tools()))
console.log('Beta inv:', JSON.stringify(lib.inv()))
