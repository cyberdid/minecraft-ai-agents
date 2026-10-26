console.log('=== Checking below (293, 71, -56) ===')
for (let y = 71; y >= 50; y--) {
  const b = bot.blockAt(new Vec3(293, y, -56))
  console.log(`y=${y}: ${b?.name}`)
}
