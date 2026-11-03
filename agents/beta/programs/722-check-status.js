// programs/722-check-status.js
console.log('Bot:', bot.username);
console.log('Position:', lib.fmt(bot.entity.position));
console.log('Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Offhand:', bot.inventory.slots[45]?.name);
console.log('Mainhand:', bot.heldItem?.name);
console.log('Blaze rods:', lib.count('blaze_rod'));
console.log('Cobblestone:', lib.count('cobblestone'));
console.log('Shield count:', lib.count('shield'));
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  rods: lib.count('blaze_rod')
};
