console.log('=== Checking Portal Site & Crafting Flint and Steel ===')

// 1. Inspect portal site at (298, 72, -54)
console.log('Blocks at portal site:')
for (let dx = 0; dx < 4; dx++) {
  for (let dy = 0; dy < 5; dy++) {
    const p = new Vec3(298 + dx, 72 + dy, -54)
    const b = bot.blockAt(p)
    console.log(`  (${p.x}, ${p.y}, ${p.z}): ${b?.name}`)
  }
}

// 2. Check Alpha entity and held item
const alpha = bot.players.alpha
if (alpha && alpha.entity) {
  console.log(`Alpha pos: ${lib.fmt(alpha.entity.position)}, held: ${alpha.entity.heldItem?.name || 'empty'}`)
}

// 3. Try to get flint from gravel
if (lib.count('flint') === 0 && lib.count('gravel') > 0) {
  console.log('Digging gravel for flint...')
  const digSpot = new Vec3(294, 72, -57)
  let tries = 0
  while (lib.count('flint') === 0 && lib.count('gravel') > 0 && tries < 15 && !isCancelled()) {
    tries++
    const cur = bot.blockAt(digSpot)
    if (cur && cur.name === 'air') {
      try {
        await lib.place('gravel', digSpot.x, digSpot.y, digSpot.z)
      } catch (e) { break }
    }
    const placed = bot.blockAt(digSpot)
    if (placed && placed.name === 'gravel') {
      try {
        await bot.equip(mcData.itemsByName.stone_shovel.id, 'hand')
        await lib.dig(digSpot.x, digSpot.y, digSpot.z)
        await sleep(200)
        await lib.pickup(4)
      } catch (e) { break }
    }
  }
  console.log(`Flint: ${lib.count('flint')}, Gravel left: ${lib.count('gravel')}`)
}

// 4. Craft flint and steel if we have flint and iron ingot
if (lib.count('flint') > 0 && lib.count('iron_ingot') > 0 && lib.count('flint_and_steel') === 0) {
  console.log('Crafting flint_and_steel...')
  await lib.craft('flint_and_steel', 1)
  console.log('Crafted flint_and_steel!')
  bot.chat('beta: Crafted flint_and_steel! Ready to ignite the Nether portal.')
}

console.log('Beta inv now:', JSON.stringify(lib.inv()))
bot.chat('beta: Checked portal site. Working on portal completion!')
