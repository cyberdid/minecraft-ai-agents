// 025-night-approach.js - monitor alpha entering base, secure door before night, sleep when possible
console.log('Time until night:', lib.time().secondsUntilNight)

// Check alpha position
const alpha = bot.players.alpha
console.log('Alpha at:', alpha?.entity ? lib.fmt(alpha.entity.position) : 'unknown')

bot.chat('beta: Night in ~120s. Door is open at (294, 72, -54). Come inside before dusk!')

// Wait until night in < 60s or alpha is inside
while (!isCancelled()) {
  const t = lib.time()
  const aPos = bot.players.alpha?.entity?.position
  
  // Is alpha inside base? (292..296, -58..-54)
  const alphaInside = aPos && aPos.x >= 292 && aPos.x <= 296 && aPos.z >= -58 && aPos.z <= -54
  
  if (t.secondsUntilNight < 60 || alphaInside) {
    console.log(`Night condition reached (night in ${t.secondsUntilNight}s, alphaInside: ${alphaInside})`)
    break
  }
  await sleep(5000)
}

// Ensure door is closed once night is near
console.log('Ensuring door is closed...')
try {
  await lib.door(294, 72, -54, false)
  console.log('Door closed successfully.')
} catch (e) {
  console.log('Door close note:', e.message)
}

// When time reaches 12542 (canSleep), try sleepInBed
while (!isCancelled()) {
  const t = lib.time()
  if (t.canSleep) {
    console.log('Can sleep now! Attempting sleepInBed...')
    bot.chat('beta: In bed sleeping! Alpha, sleep too if you have a bed.')
    try {
      await lib.sleepInBed()
      console.log('Slept in bed!')
    } catch (e) {
      console.log('Sleep note:', e.message)
    }
    break
  }
  if (t.secondsUntilNight === 0) break
  await sleep(5000)
}

console.log('Status at dusk/night:', lib.time())
console.log('Hostiles:', lib.hostiles(16))
