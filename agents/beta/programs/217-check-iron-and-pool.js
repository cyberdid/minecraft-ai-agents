console.log('=== Take Ingot & Inspect Lava Pool ===')

// 1. Take iron ingot from Furnace 1
const fBlock = bot.blockAt(new Vec3(295, 72, -55))
if (fBlock) {
  try {
    const f = await bot.openFurnace(fBlock)
    if (f.outputItem()) {
      await f.takeOutput()
      console.log('Took iron_ingot from Furnace 1!')
    }
    f.close()
  } catch (e) {}
}
console.log('Iron ingots on beta:', lib.count('iron_ingot'))

// 2. Step outside base door
try {
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {}

// 3. Move to lava pool at (333, 62, -78)
console.log('Walking to lava pool area (333, 64, -78)...')
bot.chat('beta: Inspecting lava pool at (333, 62, -78)...')
await lib.goTo(333, 64, -78, 3, { timeoutMs: 30000 })
console.log('Near lava pool at:', lib.fmt(bot.entity.position))

// 4. Find lava blocks around
const lava = bot.findBlocks({
  matching: b => b && (b.name === 'lava' || b.name === 'flowing_lava'),
  maxDistance: 16,
  count: 30
}).map(p => ({
  pos: lib.fmt(p),
  name: bot.blockAt(p).name,
  isSource: bot.blockAt(p).metadata === 0
}))

console.log(`Lava blocks found: ${lava.length}`)
const sources = lava.filter(l => l.isSource)
console.log(`Lava source blocks: ${sources.length}`)
for (const s of sources.slice(0, 10)) {
  console.log(`  Source at ${s.pos}`)
}

// 5. Return to base door
console.log('Returning to base...')
await lib.goTo(294, 72, -53, 2, { timeoutMs: 30000 })
try {
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {}

bot.chat(`beta: Lava pool verified! Found ${sources.length} lava source blocks at (333, 62, -78).`)
