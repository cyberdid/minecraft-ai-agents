// Find remaining obsidian blocks and mine until we have 10
const before = lib.count('obsidian')
console.log('Obsidian before:', before)

while (lib.count('obsidian') < 10 && !isCancelled()) {
  const obsBlocks = bot.findBlocks({
    matching: b => b && b.name === 'obsidian',
    maxDistance: 16,
    count: 20
  })
  if (!obsBlocks.length) {
    console.log('No more obsidian blocks found within 16!')
    break
  }
  // Sort by nearest
  obsBlocks.sort((a, b) => a.distanceTo(bot.entity.position) - b.distanceTo(bot.entity.position))
  const target = obsBlocks[0]
  console.log(`Mining obsidian at ${target}...`)
  await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
  await lib.goTo(target.x, target.y + 1, target.z, 3).catch(() => {})
  await lib.dig(target.x, target.y, target.z)
  // Fill hole if lava underneath so item does not burn
  await lib.place('cobblestone', target.x, target.y - 1, target.z).catch(() => {})
  await lib.pickup(4)
  console.log(`Mined ${target}. Obsidian now:`, lib.count('obsidian'))
}

console.log('Final obsidian count:', lib.count('obsidian'))
return { obsidian: lib.count('obsidian') }
