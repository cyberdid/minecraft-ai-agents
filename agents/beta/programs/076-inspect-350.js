// Inspect (350, -55, -28)
const b = bot
const p = new Vec3(350, -55, -28)
console.log('Block at', p, 'is:', b.blockAt(p)?.name, 'meta:', b.blockAt(p)?.metadata)
console.log('Under is:', b.blockAt(p.offset(0, -1, 0))?.name)
console.log('Above is:', b.blockAt(p.offset(0, 1, 0))?.name)
