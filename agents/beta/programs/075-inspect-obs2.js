// Inspect obsidian at (347, -57, -31)
const b = bot
const p = new Vec3(347, -57, -31)
console.log('Obsidian at:', p, b.blockAt(p)?.name)
console.log('Under is:', b.blockAt(p.offset(0, -1, 0))?.name)
console.log('Above is:', b.blockAt(p.offset(0, 1, 0))?.name)
