// 041-craft-boots-and-check-alpha.js - craft iron boots, equip armor, coordinate sleep/dawn with alpha
console.log('Position inside base:', lib.fmt(bot.entity.position))
console.log('Time:', lib.time())

// 1. Craft iron boots with 4 iron ingots
if (lib.count('iron_ingot') >= 4 && lib.count('iron_boots') === 0) {
  console.log('Crafting iron_boots from 4 iron ingots...')
  try {
    await lib.craft('iron_boots', 1)
    console.log('Iron boots crafted!')
  } catch (e) {
    console.log('Boots craft note:', e.message)
  }
}

// 2. Equip armor (boots + shield)
console.log('Equipping armor...')
try {
  const worn = await lib.equipArmor()
  console.log('Currently worn:', JSON.stringify(worn))
} catch (e) {
  console.log('Equip armor note:', e.message)
}

// 3. Check alpha
const alpha = bot.players.alpha
console.log('Alpha entity:', alpha?.entity ? lib.fmt(alpha.entity.position) : 'unknown')

bot.chat('beta: Crafted and equipped iron boots & shield! Alpha, enter bed so we can skip night.')

// 4. Try sleeping or wait
if (lib.time().canSleep) {
  try {
    console.log('Attempting sleep...')
    await lib.sleepInBed()
    console.log('Slept in bed!')
  } catch (e) {
    console.log('Sleep note:', e.message)
  }
}

// Wait until dawn (or skip)
while (!isCancelled()) {
  const t = lib.time()
  console.log(`Tick: ${t.timeOfDay} (${t.phase})`)
  if (t.timeOfDay >= 23460 || t.timeOfDay < 12000) {
    console.log('Dawn reached!')
    bot.chat('beta: Dawn is here! Starting Day 5 operations.')
    break
  }
  await sleep(10000)
}

const hostiles = lib.hostiles(16)
console.log('Hostiles at dawn:', JSON.stringify(hostiles))
return { worn: await lib.equipArmor(), tools: lib.tools(), inv: lib.inv(), time: lib.time() }
