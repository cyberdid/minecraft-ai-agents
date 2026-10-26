console.log('=== Stage Climb & Craft Diamond Pickaxe ===')

// 1. Fight immediate threat if hostile within 5 blocks
const closeHostiles = lib.hostiles(5)
if (closeHostiles.length > 0 && !closeHostiles.some(h => h.name === 'creeper')) {
  console.log('Clearing immediate melee threat:', JSON.stringify(closeHostiles))
  try {
    await lib.equipWeapon()
    await lib.fight(5, 10)
  } catch (e) {
    console.log('Fight note:', e.message)
  }
}

// 2. Stage 1: Climb to y=35
console.log('Climbing to stage 1 (y=35)...')
try {
  await lib.goTo(290, 35, -50, 2, { dig: true, timeoutMs: 25000 })
  console.log('Reached stage 1:', lib.fmt(bot.entity.position))
} catch (e) {
  console.log('Stage 1 note:', e.message)
}

// 3. Stage 2: Climb to y=55
console.log('Climbing to stage 2 (y=55)...')
try {
  await lib.goTo(292, 55, -52, 2, { dig: true, timeoutMs: 25000 })
  console.log('Reached stage 2:', lib.fmt(bot.entity.position))
} catch (e) {
  console.log('Stage 2 note:', e.message)
}

// 4. Stage 3: Climb to surface/base (y=72)
console.log('Climbing to base entrance (294, 72, -54)...')
try {
  await lib.goTo(294, 72, -54, 2, { dig: true, timeoutMs: 25000 })
  console.log('Reached base entrance:', lib.fmt(bot.entity.position))
} catch (e) {
  console.log('Stage 3 note:', e.message)
}

// 5. Enter base door
try {
  await lib.goThroughDoor(294, 72, -54)
  console.log('Inside base at:', lib.fmt(bot.entity.position))
} catch (e) {
  console.log('Door entry note:', e.message)
}

// 6. Craft diamond_pickaxe
if (lib.count('diamond') >= 3 && lib.count('stick') >= 2) {
  console.log('Crafting diamond_pickaxe at base crafting table...')
  await lib.craft('diamond_pickaxe', 1)
  console.log('DIAMOND PICKAXE CRAFTED!')
  bot.chat('Milestone 6 COMPLETE: A diamond pickaxe crafted by Beta!')
  await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
}

console.log('Beta tools:', JSON.stringify(lib.tools()))
console.log('Beta inv:', JSON.stringify(lib.inv()))
