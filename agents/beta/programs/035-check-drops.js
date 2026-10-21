// Check blocks at the 3 positions that were mined
const b = bot
console.log('Block at (349, -55, -29):', b.blockAt(new Vec3(349, -55, -29))?.name)
console.log('Block at (348, -55, -31):', b.blockAt(new Vec3(348, -55, -31))?.name)
console.log('Block at (348, -55, -32):', b.blockAt(new Vec3(348, -55, -32))?.name)

// Check item drops nearby!
const drops = Object.values(b.entities).filter(e => e.name === 'item')
console.log('Item drops on ground:', drops.length)
for (const d of drops) {
  console.log('  Item drop:', d.metadata, 'at:', d.position)
}
