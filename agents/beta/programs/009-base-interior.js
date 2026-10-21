// 009-base-interior.js - seal remaining roof, check torches & furniture
bot.chat('beta: Base walls and door secure. Finishing roof. Alpha, do you have torches or coal?')

// Check roof at y=75 over (292..296, -58..-54)
const missing = []
for (let x = 293; x <= 295; x++) {
  for (let z = -57; z <= -55; z++) {
    const b = lib.blockAt(x, 75, z)
    if (!b || b.boundingBox !== 'block') {
      missing.push({ x, y: 75, z })
    }
  }
}
console.log('Missing roof blocks:', missing.length)

for (const m of missing) {
  if (lib.count('oak_planks') > 0) {
    try {
      await lib.place('oak_planks', m.x, m.y, m.z)
      console.log(`Placed plank at (${m.x}, ${m.y}, ${m.z})`)
    } catch (e) {
      console.log(`Failed placing plank at (${m.x}, ${m.y}, ${m.z}):`, e.message)
    }
  }
}

// Check placed furniture inside base
const tables = lib.find('crafting_table', { maxDistance: 6 })
console.log('Crafting tables in base:', tables.map(t => lib.fmt(t.position)).join(', '))

const chests = lib.find('chest', { maxDistance: 6 })
console.log('Chests in base:', chests.map(c => lib.fmt(c.position)).join(', '))

const furnaces = lib.find('furnace', { maxDistance: 6 })
console.log('Furnaces in base:', furnaces.map(f => lib.fmt(f.position)).join(', '))

const torches = lib.find('torch', { maxDistance: 6 })
console.log('Torches in base:', torches.map(t => lib.fmt(t.position)).join(', '))

// If no crafting table placed, place one in the corner (293, 72, -55)
if (tables.length === 0 && lib.count('crafting_table') > 0) {
  try {
    await lib.place('crafting_table', 293, 72, -55)
    console.log('Placed crafting table at (293, 72, -55)')
  } catch (e) {
    console.log('Crafting table place note:', e.message)
  }
}

console.log('Time:', lib.time())
console.log('Hostiles:', lib.hostiles(16))
