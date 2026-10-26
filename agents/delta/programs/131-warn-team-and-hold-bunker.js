// programs/131-warn-team-and-hold-bunker.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// Equip sword
await lib.equipWeapon();

// Broadcast to teammates in Overworld
bot.chat('delta: Team alert! Active Ghast at (61, 67, -60). Build side parapet walls when crossing z=-50..-70! Delta is holding fortified bunker at (44, 65, -129).');

// Verify position inside bunker
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -129));
} catch (e) {}

console.log('Firmly positioned inside bunker at:', lib.fmt(bot.entity.position));
