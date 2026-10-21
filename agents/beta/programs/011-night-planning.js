// 011-night-planning.js - survey ores underground, check chest, coordinate with alpha
console.log('Surveying nearby ores from inside base...')
const coal = lib.find('coal_ore', { maxDistance: 32, count: 5 })
const deepCoal = lib.find('deepslate_coal_ore', { maxDistance: 32, count: 5 })
const iron = lib.find('iron_ore', { maxDistance: 32, count: 5 })
const deepIron = lib.find('deepslate_iron_ore', { maxDistance: 32, count: 5 })

console.log('Coal ore nearby:', coal.map(b => lib.fmt(b.position)).join(', ') || 'none')
console.log('Iron ore nearby:', iron.map(b => lib.fmt(b.position)).join(', ') || 'none')

// Check chest contents again
const chest = await lib.chestContents(293, 72, -57)
console.log('Chest contents:', JSON.stringify(chest))

// Check time
const t = lib.time()
console.log('Time:', t)
console.log('Hostiles outside:', lib.hostiles(16))

bot.chat(`beta: No coal or wool yet. Night just started. At dawn we can get wood/charcoal for torches and hunt sheep for beds.`)
