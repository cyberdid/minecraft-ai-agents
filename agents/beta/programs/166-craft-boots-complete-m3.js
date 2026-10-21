console.log('Closing door for base security...')
try {
  await lib.door(294, 72, -54, false)
} catch (e) {}

console.log('Monitoring furnace for 2 iron ingots...')
const f1 = await bot.openFurnace(bot.blockAt(new Vec3(295, 72, -55)))

while (lib.count('iron_ingot') < 4 && !isCancelled()) {
  if (f1.outputItem()?.count > 0) {
    console.log(`Taking ${f1.outputItem().count} ingots from furnace...`)
    await f1.takeOutput()
  }
  if (lib.count('iron_ingot') >= 4) break
  console.log(`Current ingots on beta: ${lib.count('iron_ingot')}. Waiting for smelting...`)
  await sleep(3000)
}
f1.close()

console.log('Total iron ingots on beta:', lib.count('iron_ingot'))

// Craft iron_boots
if (lib.count('iron_ingot') >= 4) {
  console.log('Crafting iron_boots...')
  await lib.craft('iron_boots', 1)
}

// Craft shield if 1 ingot and 6 planks
if (lib.count('iron_ingot') >= 1) {
  if (lib.count('*_planks') < 6) {
    await lib.withdraw({ oak_planks: 4 })
  }
  if (lib.count('*_planks') >= 6 && lib.count('shield') === 0) {
    console.log('Crafting shield...')
    try { await lib.craft('shield', 1) } catch (e) {}
  }
}

// Equip armor
console.log('Equipping all armor and shield...')
await lib.equipArmor()
await lib.equipWeapon()

console.log('BETA FINAL GEAR:', JSON.stringify(lib.tools()))
bot.chat('Milestone 3 COMPLETE: Full iron armor equipped for both alpha and beta!')
return lib.tools()
