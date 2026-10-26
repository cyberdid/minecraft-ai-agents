console.log('=== Recover Items from (247.6, 57.5, -78.4) ===')
bot.chat('beta: Recovering diamond_pickaxe and water_bucket from (247, 57, -78) now!')

// 1. Walk west to (248, -78) on surface
console.log('Walking west to (248, -78)...')
await lib.goToXZ(248, -78, { timeoutMs: 30000 })
console.log('Near item drop area! Beta at:', lib.fmt(bot.entity.position))

// 2. Stand on rim above water hole at (248, 63, -78)
try {
  await lib.goTo(248, 63, -78, 2, { timeoutMs: 15000 })
} catch (e) {}

// 3. Scan for item drops
const items = Object.values(bot.entities).filter(e => 
  e && e.name === 'item' && e.position && e.position.distanceTo(bot.entity.position) < 16
)
console.log(`Found ${items.length} item drops near:`, items.map(it => lib.fmt(it.position)))

// 4. Pickup items
console.log('Picking up items...')
for (const it of items) {
  try {
    await lib.goTo(it.position.x, it.position.y, it.position.z, 1, { timeoutMs: 10000 })
  } catch (e) {}
}
await lib.pickup(10)

// 5. Equip armor and weapons
try {
  await lib.equipArmor()
  await lib.equipWeapon()
} catch (e) {}

console.log('Recovered items on beta:', JSON.stringify(lib.inv()))
console.log('Recovered tools on beta:', JSON.stringify(lib.tools()))

// 6. Return to base door
console.log('Returning to base (294, 72, -54)...')
await lib.goToXZ(294, -54, { timeoutMs: 30000 })
await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 })
try {
  await lib.goThroughDoor(294, 72, -54)
  console.log('Safely inside base!')
} catch (e) {}

bot.chat(`beta: Items recovered! Diamond pickaxe: ${lib.count('diamond_pickaxe')}, water_bucket: ${lib.count('water_bucket')}, flint_and_steel: ${lib.count('flint_and_steel')}.`)
