console.log('=== Craft Bucket & Prepare Obsidian Mining ===')

// 1. Check Furnace 1 for smelted iron ingot
const fBlock = bot.blockAt(new Vec3(295, 72, -55))
if (fBlock) {
  try {
    const f = await bot.openFurnace(fBlock)
    if (f.outputItem()) {
      console.log(`Taking ${f.outputItem().count} ${f.outputItem().name} from furnace...`)
      await f.takeOutput()
    }
    f.close()
  } catch (e) {
    console.log('Furnace error:', e.message)
  }
}

console.log('Iron ingots on beta:', lib.count('iron_ingot'))

// 2. Craft bucket
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0 && lib.count('water_bucket') === 0) {
  console.log('Crafting bucket...')
  await lib.craft('bucket', 1)
  console.log('Bucket crafted!')
}

// 3. Check if Alpha tossed water_bucket
await lib.pickup(4)
console.log('Bucket status:', {
  water_bucket: lib.count('water_bucket'),
  bucket: lib.count('bucket')
})

// 4. Deposit clutter into chest to free inventory
try {
  await lib.deposit({
    granite: 'all',
    diorite: 'all',
    andesite: 'all',
    cobbled_deepslate: 'all',
    tuff: 'all',
    cobblestone: 30
  })
  console.log('Deposited rock clutter into chest')
} catch (e) {}

console.log('Beta tools:', JSON.stringify(lib.tools()))
console.log('Beta inv:', JSON.stringify(lib.inv()))
bot.chat(`beta: Ready to make obsidian! Tools: diamond_pickaxe, bucket=${lib.count('bucket')+lib.count('water_bucket')}, flint_and_steel=${lib.count('flint_and_steel')}.`)
