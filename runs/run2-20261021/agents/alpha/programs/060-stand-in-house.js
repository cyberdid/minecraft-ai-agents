console.log('Crafting table is at (13, 67, -24). Standing beside it...');
// Let's go to (13, 67, -23) right next to crafting table
const movements = new Movements(bot, mcData);
movements.canDig = false;
bot.pathfinder.setMovements(movements);
await bot.pathfinder.goto(new goals.GoalBlock(13, 67, -23));
console.log('Now at:', bot.entity.position);

// Check if enclosed or seal with our sand blocks
const pos = bot.entity.position;
console.log('Standing at:', lib.fmt(pos));
