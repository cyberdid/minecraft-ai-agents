const alpha = Object.values(bot.entities).find(e => e.username === 'alpha')
if (alpha) {
  console.log('Alpha is at:', alpha.position, 'dist:', bot.entity.position.distanceTo(alpha.position))
  bot.chat('alpha: Are you in base? Bed 2 is ready if you can sleep with me to skip night!')
} else {
  console.log('Alpha is not within view distance')
}
