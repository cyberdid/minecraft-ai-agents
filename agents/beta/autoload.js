// beta autoload.js
// Custom helpers for Beta

// Reliably scoops a water source block using an empty bucket
globalThis.scoopWaterBlock = async function (pos) {
  const block = bot.blockAt(pos)
  if (!block || (block.name !== 'water' && block.name !== 'flowing_water')) {
    return false
  }
  await bot.equip(mcData.itemsByName.bucket.id, 'hand')
  await bot.lookAt(pos.offset(0.5, 0.5, 0.5), true)
  await bot.activateBlock(block)
  await sleep(600)
  return lib.count('water_bucket') > 0
}

// Safely mines obsidian on dry ground with diamond pickaxe
globalThis.mineDryObsidian = async function (targetCount = 10) {
  while (lib.count('obsidian') < targetCount && !isCancelled()) {
    const obsBlocks = bot.findBlocks({
      matching: b => b && b.name === 'obsidian',
      maxDistance: 8,
      count: 20
    })
    if (!obsBlocks.length) break
    for (const p of obsBlocks) {
      if (lib.count('obsidian') >= targetCount || isCancelled()) break
      await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
      await lib.dig(p.x, p.y, p.z)
      await lib.pickup(4)
    }
  }
  return lib.count('obsidian')
}

// Configure pathfinder to strictly avoid fire, soul fire, and lava
globalThis.configureFireAvoidance = function () {
  if (!bot.pathfinder || !mcData) return
  const moves = new Movements(bot, mcData)
  if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id)
  if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id)
  if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id)
  moves.canDig = false
  bot.pathfinder.setMovements(moves)
  console.log('Pathfinder movements updated: fire, soul_fire, lava blocked!')
}
