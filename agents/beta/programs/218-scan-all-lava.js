console.log('=== Scan Lava Pools & Craft Flint & Steel ===')

// 1. Craft flint and steel
const chest = await lib.chestContents()
if (chest['gravel'] > 0 && lib.count('flint') === 0 && lib.count('flint_and_steel') === 0) {
  try {
    await lib.withdraw({ gravel: 1 })
    console.log('Withdrew gravel from chest')
  } catch (e) {}
}

if (lib.count('gravel') > 0 && lib.count('flint') === 0 && lib.count('flint_and_steel') === 0) {
  // shovel gravel for flint
  console.log('Digging gravel for flint...')
  const digSpot = new Vec3(294, 72, -57)
  let tries = 0
  while (lib.count('flint') === 0 && lib.count('gravel') > 0 && tries < 15 && !isCancelled()) {
    tries++
    const cur = bot.blockAt(digSpot)
    if (cur && cur.name === 'air') {
      try { await lib.place('gravel', digSpot.x, digSpot.y, digSpot.z) } catch (e) { break }
    }
    const placed = bot.blockAt(digSpot)
    if (placed && placed.name === 'gravel') {
      try {
        await lib.dig(digSpot.x, digSpot.y, digSpot.z)
        await sleep(200)
        await lib.pickup(4)
      } catch (e) { break }
    }
  }
}

if (lib.count('flint') > 0 && lib.count('iron_ingot') > 0 && lib.count('flint_and_steel') === 0) {
  console.log('Crafting flint_and_steel...')
  await lib.craft('flint_and_steel', 1)
  console.log('Crafted flint_and_steel!')
  bot.chat('beta: Flint and steel crafted! Ready to ignite the portal.')
}

// 2. Scan for lava source blocks within 96 blocks
const lavaSources = bot.findBlocks({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 96,
  count: 64
})
console.log(`Found ${lavaSources.length} lava source blocks within 96 blocks:`)
const byY = {}
for (const p of lavaSources) {
  byY[p.y] = (byY[p.y] || 0) + 1
}
console.log('Lava sources by Y level:', JSON.stringify(byY))

// 3. Scan for diamonds within 96 blocks
const diamonds = bot.findBlocks({
  matching: b => b && (b.name === 'diamond_ore' || b.name === 'deepslate_diamond_ore'),
  maxDistance: 96,
  count: 20
})
console.log(`Found ${diamonds.length} diamond ores within 96 blocks:`, diamonds.map(p => lib.fmt(p)))

console.log('Beta inv:', JSON.stringify(lib.inv()))
console.log('Beta tools:', JSON.stringify(lib.tools()))
