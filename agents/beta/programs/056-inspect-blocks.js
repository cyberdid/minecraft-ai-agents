// Inspect (345, -55, -31) and (345, -56, -31)
const b = bot
console.log('(345, -55, -31):', b.blockAt(new Vec3(345, -55, -31))?.name)
console.log('(345, -56, -31):', b.blockAt(new Vec3(345, -56, -31))?.name)
console.log('(344, -54, -32):', b.blockAt(new Vec3(344, -54, -32))?.name)
console.log('(344, -55, -32):', b.blockAt(new Vec3(344, -55, -32))?.name)
console.log('(344, -56, -32):', b.blockAt(new Vec3(344, -56, -32))?.name)
