console.log('Heading down safe staircase to y=-54...')
await lib.goTo(350, -54, -30, 2)
console.log('Arrived at:', bot.entity.position)

const items = Object.values(bot.entities).filter(e => e.name === 'item')
console.log(`Found ${items.length} item entities nearby:`)
for (const it of items) {
  console.log(`Item at (${it.position.x.toFixed(1)}, ${it.position.y.toFixed(1)}, ${it.position.z.toFixed(1)}) dist: ${bot.entity.position.distanceTo(it.position).toFixed(1)}`)
}

console.log('Picking up items...')
await lib.pickup(16)

console.log('Inventory after pickup:', JSON.stringify(lib.inv()))
return lib.inv()
