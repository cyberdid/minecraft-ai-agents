console.log('=== Return to Base & Refuel ===')

// 1. Eat 1 raw beef to restore sprint
if (bot.food <= 7 && lib.count('beef') > 0) {
  console.log('Eating 1 beef for sprint...')
  try {
    await bot.equip(mcData.itemsByName.beef.id, 'hand')
    await bot.consume()
    console.log('Consumed beef. Food now:', bot.food)
  } catch (e) {
    console.log('Consume beef error:', e.message)
  }
}

// 2. Check nearby surface water
if (lib.count('bucket') > 0 && lib.count('water_bucket') === 0) {
  try {
    const water = bot.findBlock({
      matching: b => b && b.name === 'water' && b.metadata === 0 && bot.blockAt(b.position.offset(0, 1, 0))?.name === 'air',
      maxDistance: 32
    })
    if (water) {
      console.log('Water source found at:', lib.fmt(water.position))
      await lib.fillBucket('water')
      console.log('Filled water bucket! water_bucket:', lib.count('water_bucket'))
      bot.chat('beta: Filled water bucket! Milestone 5 water requirement met.')
    } else {
      console.log('No open water source within 32 blocks.')
    }
  } catch (e) {
    console.log('Fill bucket note:', e.message)
  }
}

// 3. Return to base via goToXZ then goTo
console.log('Heading back towards base (294, -53)...')
bot.chat('beta: Returning to base with beef and leather.')
await lib.goToXZ(294, -53, { timeoutMs: 90000 })
console.log('Near base area:', lib.fmt(bot.entity.position))

await lib.goTo(294, 72, -53, 2, { timeoutMs: 30000 })
console.log('Arrived near base door at:', lib.fmt(bot.entity.position))

// 4. Enter base
try {
  await lib.goThroughDoor(294, 72, -54)
  console.log('Inside base at:', lib.fmt(bot.entity.position))
} catch (e) {
  console.log('Door entry note:', e.message)
}

// 5. Smelt beef in furnace at (295, 72, -55)
if (lib.count('beef') > 0) {
  console.log('Smelting beef in furnace...')
  try {
    const fBlock = bot.blockAt(new Vec3(295, 72, -55))
    const f = await bot.openFurnace(fBlock)
    if (!f.fuelItem() && lib.count('birch_planks') > 0) {
      await f.putFuel(mcData.itemsByName.birch_planks.id, null, 2)
    }
    if (lib.count('beef') > 0) {
      await f.putInput(mcData.itemsByName.beef.id, null, lib.count('beef'))
    }
    f.close()
    console.log('Beef placed in furnace to cook!')
  } catch (e) {
    console.log('Furnace note:', e.message)
  }
}

console.log('Status at end of return:', lib.fmt(bot.entity.position), 'Food:', bot.food)
