// Inspect (351, -55, -27)
const b = bot
const p = new Vec3(351, -55, -27)
console.log('Block at (351, -55, -27):', b.blockAt(p)?.name, 'meta:', b.blockAt(p)?.metadata)
console.log('Under is:', b.blockAt(p.offset(0, -1, 0))?.name)
console.log('Above is:', b.blockAt(p.offset(0, 1, 0))?.name)
return { name: b.blockAt(p)?.name, under: b.blockAt(p.offset(0, -1, 0))?.name }
