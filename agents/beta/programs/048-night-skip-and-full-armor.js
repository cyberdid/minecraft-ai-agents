// 048-night-skip-and-full-armor.js - harvest remaining ingots, craft leggings/helmet, equip full armor, sleep at 12542
console.log('Position inside base:', lib.fmt(bot.entity.position))
console.log('Time until night:', lib.time().secondsUntilNight)

// 1. Check furnace at (295, 72, -55) and take any remaining iron ingots
const furnaceBlock = lib.blockAt(295, 72, -55)
const furnace = await bot.openFurnace(furnaceBlock)

if (furnace.outputItem() && furnace.outputItem().name === 'iron_ingot') {
  console.log(`Harvesting remaining ${furnace.outputItem().count}x iron ingots...`)
  await furnace.takeOutput()
}
furnace.close()

console.log('Total iron ingots in inventory:', lib.count('iron_ingot'))

// 2. Craft leggings (7 ingots)
if (lib.count('iron_ingot') >= 7 && lib.count('iron_leggings') === 0) {
  console.log('Crafting iron_leggings...')
  try {
    await lib.craft('iron_leggings', 1)
    console.log('Iron leggings crafted!')
  } catch (e) {
    console.log('Leggings craft error:', e.message)
  }
}

// 3. Craft helmet (5 ingots)
if (lib.count('iron_ingot') >= 5 && lib.count('iron_helmet') === 0) {
  console.log('Crafting iron_helmet...')
  try {
    await lib.craft('iron_helmet', 1)
    console.log('Iron helmet crafted!')
  } catch (e) {
    console.log('Helmet craft error:', e.message)
  }
}

// 4. Equip all armor & shield
const worn = await lib.equipArmor()
console.log('Currently worn:', JSON.stringify(worn))

// 5. Ensure door is closed
try {
  await lib.door(294, 72, -54, false)
} catch (e) {}

// 6. Wait for tick 12542 and sleep
while (!isCancelled()) {
  const t = lib.time()
  console.log(`Current tick: ${t.timeOfDay} (${t.phase}) | canSleep: ${t.canSleep}`)
  if (t.canSleep) {
    console.log('Dusk/night arrived! Sleeping in bed...')
    bot.chat('beta: Sleeping in bed now! Skipping night.')
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

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Tools:', JSON.stringify(lib.tools()))
console.log('Armor worn:', JSON.stringify(await lib.equipArmor()))
console.log('Time:', lib.time())

return { worn: await lib.equipArmor(), inv: lib.inv(), time: lib.time() }
