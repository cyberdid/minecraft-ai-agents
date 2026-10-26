// programs/159-unite-with-gamma-and-coordinate.js
console.log('Pos before:', lib.fmt(bot.entity.position));

// 1. Look towards Gamma at (45, 66, -124)
const gamma = bot.players['gamma']?.entity;
if (gamma) {
  await bot.lookAt(gamma.position.offset(0, 1.6, 0), true);
  console.log('Gamma pos:', lib.fmt(gamma.position), 'held:', gamma.heldItem?.name);
}

// 2. Chat welcome and coordinate
bot.chat('delta: Welcome Gamma! Step into the blast-proof hallway at (44, 65, -128..-134). Alpha & Beta transiting now.');

// 3. Move together into advance tunnel at (44.5, 65.0, -133.0)
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -133));
} catch (e) {}

console.log('Positioned inside advance tunnel at:', lib.fmt(bot.entity.position));

// 4. Equip weapon
await lib.equipWeapon();
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Delta inventory:', JSON.stringify(lib.inv()));
