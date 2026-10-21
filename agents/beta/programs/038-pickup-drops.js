// Check all item drops on the ground
const b = bot
const drops = Object.values(b.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) <= 16)
console.log('Nearby item drops count:', drops.length)
for (const d of drops) {
  const meta = d.metadata
  console.log(`Drop at ${d.position}:`, JSON.stringify(meta))
}
console.log('Calling lib.pickup(16)...')
const gained = await lib.pickup(16)
console.log('Gained:', JSON.stringify(gained))
console.log('Obsidian in inventory now:', lib.count('obsidian'))
return { obsidian: lib.count('obsidian') }
