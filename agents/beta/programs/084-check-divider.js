// Check blocks at (350, -55, -29) and (349, -55, -28)
const b = bot
console.log('(350, -55, -29):', b.blockAt(new Vec3(350, -55, -29))?.name)
console.log('(349, -55, -28):', b.blockAt(new Vec3(349, -55, -28))?.name)
console.log('(350, -55, -28):', b.blockAt(new Vec3(350, -55, -28))?.name)
return {}
