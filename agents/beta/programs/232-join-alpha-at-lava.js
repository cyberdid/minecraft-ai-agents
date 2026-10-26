console.log('=== Join Alpha at Lava Pool & Mine Obsidian ===')

// 1. Withdraw cooked beef from chest and eat
const chest = await lib.chestContents()
if (chest['cooked_beef'] > 0) {
  try {
    await lib.withdraw({ cooked_beef: 1 })
    await bot.equip(mcData.itemsByName.cooked_beef.id, 'hand')
    await bot.consume()
    console.log('Ate cooked beef! Food now:', bot.food)
  } catch (e) {}
}

// 2. Step outside base door
try {
  await lib.goThroughDoor(294, 72, -54)
  console.log('Stepped outside door at:', lib.fmt(bot.entity.position))
} catch (e) {}

// 3. Move to lava pool at (333, 64, -78)
bot.chat('beta: Joining Alpha at lava pool (333, 62, -78) with diamond pickaxe!')
console.log('Walking to (333, 64, -78)...')
await lib.goTo(333, 64, -78, 2, { timeoutMs: 30000 })
console.log('Arrived near Alpha and lava pool! Beta at:', lib.fmt(bot.entity.position))

// 4. Check for obsidian blocks
const obsBlocks = bot.findBlocks({
  matching: b => b && b.name === 'obsidian',
  maxDistance: 16,
  count: 20
})
console.log(`Obsidian blocks found at pool: ${obsBlocks.length}`)

// 5. Mine any obsidian blocks found with diamond pickaxe
for (const p of obsBlocks) {
  if (lib.count('obsidian') >= 10 || isCancelled()) break
  console.log(`Mining obsidian at ${lib.fmt(p)} with diamond_pickaxe...`)
  try {
    await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
    await lib.goTo(p.x, p.y + 1, p.z, 2, { timeoutMs: 15000 })
    await lib.dig(p.x, p.y, p.z)
    await sleep(200)
    await lib.pickup(4)
    console.log(`Mined obsidian! Count now: ${lib.count('obsidian')}`)
  } catch (e) {
    console.log(`Obsidian dig error at ${lib.fmt(p)}:`, e.message)
  }
}

// Check Alpha entity
const alpha = bot.players.alpha
if (alpha && alpha.entity) {
  console.log(`Alpha at: ${lib.fmt(alpha.entity.position)}, held: ${alpha.entity.heldItem?.name}`)
}

console.log('Total obsidian on beta:', lib.count('obsidian'))
bot.chat(`beta: At lava pool. Obsidian on beta: ${lib.count('obsidian')}.`)
console.log('Beta inv:', JSON.stringify(lib.inv()))
console.log('Beta tools:', JSON.stringify(lib.tools()))
