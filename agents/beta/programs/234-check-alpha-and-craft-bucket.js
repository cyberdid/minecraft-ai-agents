console.log('=== Smelt 3rd Ingot with Wooden Pickaxe & Craft Bucket ===')

// 1. Take wooden_pickaxe from chest as fuel
const chest = await lib.chestContents()
if (chest['wooden_pickaxe'] > 0) {
  try {
    await lib.withdraw({ wooden_pickaxe: 1 })
    console.log('Withdrew wooden_pickaxe from chest as fuel')
  } catch (e) {}
}

// 2. Put wooden_pickaxe as fuel and 1 raw_iron as input in Furnace 1
const fBlock = bot.blockAt(new Vec3(295, 72, -55))
if (fBlock) {
  try {
    const f = await bot.openFurnace(fBlock)
    if (lib.count('wooden_pickaxe') > 0) {
      await f.putFuel(mcData.itemsByName.wooden_pickaxe.id, null, 1)
      console.log('Put wooden_pickaxe as fuel!')
    }
    if (lib.count('raw_iron') > 0 && f.inputItem() === null) {
      await f.putInput(mcData.itemsByName.raw_iron.id, null, 1)
      console.log('Put 1 raw_iron as input!')
    }
    f.close()
    
    // Wait ~12s for smelt
    console.log('Waiting for iron to smelt...')
    await sleep(12000)
    
    const f2 = await bot.openFurnace(fBlock)
    if (f2.outputItem()) {
      await f2.takeOutput()
      console.log('Took smelted iron ingot!')
    }
    f2.close()
  } catch (e) {
    console.log('Furnace error:', e.message)
  }
}

console.log('Iron ingots on beta:', lib.count('iron_ingot'))

// 3. Craft bucket
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0) {
  console.log('Crafting bucket...')
  await lib.craft('bucket', 1)
  console.log('Bucket crafted!')
}

// 4. Check Alpha
const alpha = bot.players.alpha
if (alpha && alpha.entity) {
  console.log(`Alpha at: ${lib.fmt(alpha.entity.position)}, held: ${alpha.entity.heldItem?.name}`)
}

bot.chat(`beta: Bucket crafted: ${lib.count('bucket') > 0}. Alpha, let us make obsidian for the portal!`)
console.log('Beta inv:', JSON.stringify(lib.inv()))
console.log('Beta tools:', JSON.stringify(lib.tools()))
