console.log('=== Finding Staircase Torches & Recovering Items ===')

// 1. Walk back to (311, 65, -65) where descend started
console.log('Moving to staircase entrance (311, 65, -65)...')
await lib.goTo(311, 65, -65, 2, { timeoutMs: 25000 })
console.log('At staircase entrance area:', lib.fmt(bot.entity.position))

// 2. Find all torches sorted by Y descending (from surface down)
const torches = bot.findBlocks({
  matching: b => b && (b.name === 'torch' || b.name === 'wall_torch'),
  maxDistance: 64,
  count: 50
}).sort((a, b) => b.y - a.y) // highest Y to lowest Y

console.log(`Found ${torches.length} torches along descent:`)
for (const t of torches) {
  console.log(`  Torch at ${lib.fmt(t)}`)
}

// 3. Follow torches down
for (let i = 0; i < torches.length; i++) {
  const t = torches[i]
  console.log(`Heading to torch ${i+1}/${torches.length} at ${lib.fmt(t)}...`)
  try {
    await lib.goTo(t.x, t.y, t.z, 2, { timeoutMs: 15000 })
  } catch (e) {
    console.log(`Could not reach torch at ${lib.fmt(t)}: ${e.message}`)
  }
  // Check if we see item drops
  const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 16)
  if (items.length > 0) {
    console.log(`Found ${items.length} item drops near ${lib.fmt(bot.entity.position)}!`)
    break
  }
}

// 4. Move to death coordinates (362, -25, -70)
console.log('Navigating to exact death location (362, -25, -70)...')
try {
  await lib.goTo(362, -25, -70, 2, { timeoutMs: 30000 })
} catch (e) {
  console.log('Direct goTo note:', e.message)
}

// 5. Pickup all drops
console.log('Picking up all items within 12 blocks...')
await lib.pickup(12)

// 6. Equip armor and weapon
try {
  await lib.equipArmor()
  await lib.equipWeapon()
} catch (e) {}

// 7. Check for hostiles and fight if needed
const hostiles = lib.hostiles(8)
if (hostiles.length > 0) {
  console.log('Fighting hostiles at death site:', JSON.stringify(hostiles))
  try {
    await lib.fight(8, 15)
  } catch (e) {}
}

await lib.pickup(10)
console.log('Beta recovered inventory:', JSON.stringify(lib.inv()))
console.log('Beta gear:', JSON.stringify(lib.tools()))
console.log('Armor worn:', bot.inventory.slots.filter(s => s && s.name.includes('iron_')).map(s => s.name))

bot.chat(`beta: Recovery result - Iron pickaxe: ${lib.count('iron_pickaxe')}, flint_and_steel: ${lib.count('flint_and_steel')}, iron armor pieces: ${bot.inventory.slots.filter(s => s && s.name.includes('iron_')).length}.`)
