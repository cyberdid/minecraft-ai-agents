console.log('Moving to (349.5, -55, -29)...')
await bot.pathfinder.goto(new goals.GoalBlock(349, -55, -29))
console.log('Arrived at:', bot.entity.position)

// Dig (350, -54, -27)
const b1 = bot.blockAt(new Vec3(350, -54, -27))
if (b1 && b1.name !== 'air') {
  console.log('Digging (350, -54, -27)...', b1.name)
  await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
  await lib.dig(350, -54, -27)
}

// Dig (350, -55, -27)
const b2 = bot.blockAt(new Vec3(350, -55, -27))
if (b2 && b2.name !== 'air') {
  console.log('Digging (350, -55, -27)...', b2.name)
  await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
  await lib.dig(350, -55, -27)
}

await sleep(1000)

console.log('State around (351, -55, -27):')
console.log('351,-55,-27:', bot.blockAt(new Vec3(351, -55, -27))?.name, bot.blockAt(new Vec3(351, -55, -27))?.metadata)
console.log('350,-55,-27:', bot.blockAt(new Vec3(350, -55, -27))?.name, bot.blockAt(new Vec3(350, -55, -27))?.metadata)
console.log('351,-54,-27:', bot.blockAt(new Vec3(351, -54, -27))?.name)
