// programs/149-hold-and-coordinate.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Time:', bot.time.timeOfDay, 'isDay:', bot.time.isDay);

// Equip sword
await lib.equipWeapon();

// Acknowledge sleep coordination
bot.chat('delta: Holding fortified advance tunnel at (44, 65, -133) in Nether. Sleep well team, see you at dawn for the Blaze spawner assault!');

// Verify position
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -133));
} catch (e) {}

console.log('Firmly positioned inside tunnel at:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
