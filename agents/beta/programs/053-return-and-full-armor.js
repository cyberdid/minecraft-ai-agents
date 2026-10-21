// 053-return-and-full-armor.js - return to base, smelt 15 raw iron, craft iron pickaxe, leggings, helmet, equip full iron armor
console.log('Current position:', lib.fmt(bot.entity.position))
console.log('Time left in day:', lib.time().secondsUntilNight)

// 1. Return to base floor at (294, 72, -52)
console.log('Returning to base at (294, 72, -52)...')
await lib.goTo(294, 72, -52, 1, { dig: true })

// 2. Enter base through door
try {
  await lib.door(294, 72, -54, true)
  await lib.walkTo(294, -56)
  await lib.door(294, 72, -54, false)
} catch (e) {
  console.log('Door passage note:', e.message)
}
console.log('Inside base at:', lib.fmt(bot.entity.position))

// 3. Craft fresh iron_pickaxe right away from our 4 ingots
if (lib.count('iron_ingot') >= 3 && lib.count('iron_pickaxe') === 0) {
  console.log('Crafting fresh iron_pickaxe...')
  try {
    if (lib.count('stick') < 2) await lib.craft('stick', 4)
    await lib.craft('iron_pickaxe', 1)
    console.log('Fresh iron_pickaxe crafted!')
  } catch (e) {
    console.log('Pickaxe craft note:', e.message)
  }
}

// 4. Smelt 15 raw_iron in furnace at (295, 72, -55)
const furnaceBlock = lib.blockAt(295, 72, -55)
if (furnaceBlock?.name === 'furnace' && lib.count('raw_iron') > 0) {
  console.log(`Smelting ${lib.count('raw_iron')} raw_iron...`)
  try {
    const f = await bot.openFurnace(furnaceBlock)
    
    // Put raw_iron into slot 0
    const rawItem = f.slots.slice(3).find(i => i && i.name === 'raw_iron')
    if (rawItem && !f.slots[0]) {
      await bot.clickWindow(rawItem.slot, 0, 0)
      await bot.clickWindow(0, 0, 0)
      await lib.stowCursor()
    }
    
    // Check fuel in slot 1
    if (!f.slots[1]) {
      const fuel = f.slots.slice(3).find(i => i && (i.name.endsWith('_planks') || i.name.endsWith('_log')))
      if (fuel) {
        await bot.clickWindow(fuel.slot, 0, 0)
        await bot.clickWindow(1, 0, 0)
        await lib.stowCursor()
      }
    }
    
    // Harvest ingots
    console.log('Harvesting smelted ingots...')
    for (let i = 0; i < 30; i++) {
      await sleep(1500)
      if (f.outputItem()) {
        await f.takeOutput()
      }
      if (lib.count('iron_ingot') >= 12 || !f.inputItem()) break
    }
    f.close()
  } catch (fe) {
    console.log('Furnace note:', fe.message)
  }
}

console.log('Total iron ingots in inventory:', lib.count('iron_ingot'))

// 5. Craft iron_leggings (7 ingots)
if (lib.count('iron_ingot') >= 7 && lib.count('iron_leggings') === 0) {
  console.log('Crafting iron_leggings...')
  try {
    await lib.craft('iron_leggings', 1)
    console.log('Iron leggings crafted!')
  } catch (e) {
    console.log('Leggings error:', e.message)
  }
}

// 6. Craft iron_helmet (5 ingots)
if (lib.count('iron_ingot') >= 5 && lib.count('iron_helmet') === 0) {
  console.log('Crafting iron_helmet...')
  try {
    await lib.craft('iron_helmet', 1)
    console.log('Iron helmet crafted!')
  } catch (e) {
    console.log('Helmet error:', e.message)
  }
}

// 7. Equip all armor
const worn = await lib.equipArmor()
console.log('Currently worn armor:', JSON.stringify(worn))

const fullArmor = worn.head?.includes('iron') && worn.torso?.includes('iron') && worn.legs?.includes('iron') && worn.feet?.includes('iron')
if (fullArmor) {
  bot.chat('beta: Milestone 3 complete! Wearing FULL IRON ARMOR and shield!')
} else {
  bot.chat(`beta: Armor status: ${JSON.stringify(worn)}`)
}

// 8. Sleep if night arrives
const t = lib.time()
if (t.canSleep) {
  console.log('Dusk/night active, sleeping in bed...')
  try {
    await lib.sleepInBed()
    console.log('Slept in bed!')
  } catch (se) {}
}

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Tools:', JSON.stringify(lib.tools()))
console.log('Time left:', lib.time().secondsUntilNight)

return { worn, fullArmor, tools: lib.tools(), inv: lib.inv(), time: lib.time() }
