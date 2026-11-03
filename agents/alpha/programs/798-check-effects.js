// programs/798-check-effects.js
console.log('Bot health:', bot.health);
console.log('Bot food:', bot.food);
console.log('Effects:', Object.keys(bot.entity.effects || {}).map(id => {
  const eff = bot.entity.effects[id];
  return `${id}: amp=${eff.amplifier}, dur=${eff.duration}`;
}));
console.log('Metadata:', bot.entity.metadata);
