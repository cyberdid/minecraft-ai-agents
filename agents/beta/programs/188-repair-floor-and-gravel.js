console.log('=== Floor Repair & Gravel Digging ===')

// 1. Repair floor hole at (293, y, -56)
for (let y = 69; y <= 71; y++) {
  const p = new Vec3(293, y, -56)
  const b = bot.blockAt(p)
  if (b && b.name === 'air') {
    console.log(`Placing cobblestone at ${lib.fmt(p)}...`)
    try {
      await lib.place('cobblestone', p.x, p.y, p.z)
      console.log(`Placed cobblestone at ${lib.fmt(p)}`)
    } catch (e) {
      console.log(`Place error at ${lib.fmt(p)}:`, e.message)
    }
  }
}

// 2. Craft sticks and stone shovel if needed
if (lib.count('stick') < 2 && lib.count('birch_planks') >= 2) {
  console.log('Crafting sticks...')
  await lib.craft('stick', 4)
}
if (lib.count('stone_shovel') === 0 && lib.count('stick') >= 2 && lib.count('cobblestone') >= 1) {
  console.log('Crafting stone_shovel...')
  await lib.craft('stone_shovel', 1)
}

// 3. Dig gravel for flint
const digSpot = new Vec3(293, 72, -55)
let attempts = 0
while (lib.count('gravel') > 0 && lib.count('flint') === 0 && attempts < 20 && !isCancelled()) {
  attempts++
  const cur = bot.blockAt(digSpot)
  if (cur && cur.name === 'air') {
    try {
      await lib.place('gravel', digSpot.x, digSpot.y, digSpot.z)
    } catch (e) {
      console.log('Place gravel error:', e.message)
      break
    }
  }
  const placed = bot.blockAt(digSpot)
  if (placed && placed.name === 'gravel') {
    try {
      await bot.equip(mcData.itemsByName.stone_shovel.id, 'hand')
      await lib.dig(digSpot.x, digSpot.y, digSpot.z)
      await sleep(300)
      await lib.pickup(4)
    } catch (e) {
      console.log('Dig gravel error:', e.message)
      break
    }
  }
}

console.log(`Flint: ${lib.count('flint')}, Gravel: ${lib.count('gravel')}`)
bot.chat('alpha: Floor repaired at (293,71,-56) for bed 2. Ready for dawn.')
