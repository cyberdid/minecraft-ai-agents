// 024-check-alpha-and-night.js - coordinate with alpha inside base, prepare for night
const alpha = bot.players.alpha
console.log('Alpha entity:', alpha?.entity ? lib.fmt(alpha.entity.position) : 'not visible')

bot.chat('alpha: Bed is at (293, 72, -56) and floor holes are patched. Right click bed to set spawn! Night in ~150s.')

// Check chest
const chest = await lib.chestContents(293, 72, -57)
console.log('Chest contents:', JSON.stringify(chest))

// Check door
const door = lib.blockAt(294, 72, -54)
console.log('Door block:', door?.name)

// Place our spare torch on the base wall if not lit enough
const torches = lib.find('torch', { maxDistance: 10 })
console.log('Torches in base:', torches.length)
if (torches.length < 2 && lib.count('torch') > 0) {
  try {
    await lib.place('torch', 295, 73, -56)
    console.log('Placed second torch at (295, 73, -56)')
  } catch (e) {
    console.log('Torch place note:', e.message)
  }
}

const t = lib.time()
console.log('Time:', t)
console.log('Seconds until night:', t.secondsUntilNight)
