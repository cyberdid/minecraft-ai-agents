// Check the two exposed lava blocks and their air space above
const b = bot
console.log('Target 1 at (350, -55, -28):', b.blockAt(new Vec3(350, -55, -28))?.name, 'meta:', b.blockAt(new Vec3(350, -55, -28))?.metadata)
console.log('  Above 1 at (350, -54, -28):', b.blockAt(new Vec3(350, -54, -28))?.name)

console.log('Target 2 at (351, -55, -27):', b.blockAt(new Vec3(351, -55, -27))?.name, 'meta:', b.blockAt(new Vec3(351, -55, -27))?.metadata)
console.log('  Above 2 at (351, -54, -27):', b.blockAt(new Vec3(351, -54, -27))?.name)
return { t1: b.blockAt(new Vec3(350, -55, -28))?.name, t2: b.blockAt(new Vec3(351, -55, -27))?.name }
