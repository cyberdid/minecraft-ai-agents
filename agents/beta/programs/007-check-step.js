// Check blocks at x=366
const b = bot
console.log('at (366, -37, -30):', b.blockAt(new Vec3(366, -37, -30))?.name)
console.log('at (366, -38, -30):', b.blockAt(new Vec3(366, -38, -30))?.name)
console.log('at (366, -39, -30):', b.blockAt(new Vec3(366, -39, -30))?.name)
console.log('at (365, -39, -30):', b.blockAt(new Vec3(365, -39, -30))?.name)
console.log('at (365, -40, -30):', b.blockAt(new Vec3(365, -40, -30))?.name)
return {}
