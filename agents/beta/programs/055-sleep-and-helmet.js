// 055-sleep-and-helmet.js - harvest furnace ingots, craft iron helmet (completing full iron armor!), sleep in bed with alpha
console.log('Position inside base:', lib.fmt(bot.entity.position))
console.log('Time until night:', lib.time().secondsUntilNight)

// 1. Harvest furnace output at (295, 72, -55)
const furnaceBlock = lib.blockAt(295, 72, -55)
if (furnaceBlock?.name === 'furnace') {
  try {
    const f = await bot.openFurnace(furnaceBlock)
    if (f.outputItem()) {
      console.log(`Harvesting ${f.outputItem().count}x ${f.outputItem().name}...`)
      await f.takeOutput()
    }
    f.close()
  } catch (fe) {
    console.log('Furnace note:', fe.message)
  }
}

console.log('Iron ingots count:', lib.count('iron_ingot'))

// 2. Craft iron_helmet (5 ingots)
if (lib.count('iron_ingot') >= 5 && lib.count('iron_helmet') === 0) {
  console.log('Crafting iron_helmet...')
  try {
    await lib.craft('iron_helmet', 1)
    console.log('Iron helmet crafted!')
  } catch (e) {
    console.log('Helmet craft error:', e.message)
  }
}

// 3. Equip all armor & shield
const worn = await lib.equipArmor()
console.log('Currently worn armor set:', JSON.stringify(worn))

const fullArmor = worn.head?.includes('iron') && worn.torso?.includes('iron') && worn.legs?.includes('iron') && worn.feet?.includes('iron')
if (fullArmor) {
  bot.chat('beta: Milestone 3 achieved! Wearing 100% FULL IRON ARMOR and shield!')
} else {
  bot.chat(`beta: Armor status: ${JSON.stringify(worn)}`)
}

// 4. Ensure door is closed
try {
  await lib.door(294, 72, -54, false)
} catch (e) {}

// 5. Sleep at tick 12542 in bed
while (!isCancelled()) {
  const t = lib.time()
  console.log(`Tick: ${t.timeOfDay} (${t.phase}) | canSleep: ${t.canSleep}`)
  if (t.canSleep) {
    console.log('Sleeping in bed to skip night...')
    bot.chat('beta: In bed now! Skipping night.')
    try {
      await lib.sleepInBed()
      console.log('Slept in bed!')
    } catch (e) {
      console.log('Sleep note:', e.message)
    }
    break
  }
  await sleep(3000)
}

console.log('Status after sleep:', lib.time())
console.log('Armor:', JSON.stringify(await lib.equipArmor()))
return { worn: await lib.equipArmor(), inv: lib.inv(), time: lib.time() }
