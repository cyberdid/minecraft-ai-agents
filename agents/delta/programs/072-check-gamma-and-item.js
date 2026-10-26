// programs/072-check-gamma-and-item.js
console.log('Item 110 is:', mcData.items[110]?.name);

// Check gamma
const gamma = bot.players['gamma']?.entity;
if (gamma) {
  console.log(`Gamma is at ${lib.fmt(gamma.position)}`);
}

// Check if safe path to (277, 73, -60)
console.log('Current pos:', lib.fmt(bot.entity.position));
