console.log('Equipping dirt...')
await bot.equip(mcData.itemsByName.dirt.id, 'hand')

// Step onto (348.5, 62, -31.5)
await bot.lookAt(new Vec3(348.5, 62, -31.5), true)
bot.setControlState('forward', true)
await sleep(250)
bot.setControlState('forward', false)

console.log('Position before jump:', bot.entity.position)

// Look straight down
await bot.look(bot.entity.yaw, -Math.PI / 2, true)

for (let i = 0; i < 5; i++) {
  bot.setControlState('jump', true)
  await sleep(220)
  bot.activateItem()
  await sleep(150)
  bot.setControlState('jump', false)
  await sleep(100)
  console.log(`Step ${i+1}: y = ${bot.entity.position.y.toFixed(2)}`)
  if (bot.entity.position.y >= 66) break
}

console.log('Final position after tower:', bot.entity.position)
return bot.entity.position
