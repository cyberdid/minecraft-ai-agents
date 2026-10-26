console.log('=== Waiting for Alpha & Dusk ===')
bot.chat('beta: Base only has ONE bed at (294,72,-56). If you have 3 wool, we need a 2nd bed to skip night!')

while (!isCancelled()) {
  const t = lib.time()
  const alpha = bot.players.alpha
  const alphaPos = alpha?.entity ? lib.fmt(alpha.entity.position) : 'not loaded'
  const alphaDist = alpha?.entity ? alpha.entity.position.distanceTo(bot.entity.position).toFixed(1) : 'N/A'
  
  console.log(`t=${t.timeOfDay} (${t.phase}) | night in ${t.secondsUntilNight}s | Alpha: ${alphaPos} dist ${alphaDist}`)
  
  // If night is in < 90s, ensure door is closed
  if (t.secondsUntilNight < 90) {
    try {
      const doorBlock = bot.blockAt(new Vec3(294, 72, -54))
      if (doorBlock && doorBlock.name === 'oak_door') {
        // close door if open
        await lib.door(294, 72, -54, false)
      }
    } catch (e) {}
  }

  // If sleep allowed
  if (t.canSleep) {
    console.log('Sleep is now allowed!')
    break
  }

  await sleep(5000)
}
