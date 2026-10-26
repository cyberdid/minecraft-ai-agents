// programs/163-portal-advice-and-hold.js
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Send portal instruction and warning to team
bot.chat('delta: Beta, stand completely still inside purple portal blocks at (299.5, 73, -54) for 4s to transit!');
await sleep(1000);
bot.chat('delta: Delta is holding 100% safe enclosed tunnel at (44, 65, -133). Do not open-bridge; we will build enclosed tunnel together!');

// 2. Position firmly inside tunnel
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -133));
} catch (e) {}

// 3. Equip weapon
await lib.equipWeapon();
console.log('Delta inventory now:', JSON.stringify(lib.inv()));
