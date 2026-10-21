console.log('Equipping dirt...')
await bot.equip(mcData.itemsByName.dirt.id, 'hand')
await bot.look(bot.entity.yaw, -Math.PI / 2, true)

for (let i = 0; i < 4; i++) {
  console.log(`Jump ${i+1}, current y = ${bot.entity.position.y}`)
  bot.setControlState('jump', true)
  await sleep(220)
  bot.activateItem()
  await sleep(150)
  bot.setControlState('jump', false)
  await sleep(150)
  if (bot.entity.position.y >= 66) {
    console.log('SURFACE REACHED! y =', bot.entity.position.y)
    break
  }
}

console.log('Final position:', bot.entity.position)
return bot.entity.position
