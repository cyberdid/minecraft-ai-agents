// programs/303-find-zombie-and-guide-gamma.js
console.log('=== Program 303: Find Zombie & Guide Gamma to Beta ===');

// Guide Gamma to deliver food to Beta
bot.chat('gamma: Gamma, Beta is starving at (294, 16, 2) with the 10 obsidian! Take cooked_chicken from base chest and bring it down to Beta!');

// Find zombie
const z = Object.values(bot.entities).find(e => e.name === 'zombie' && bot.entity.position.distanceTo(e.position) < 16);
if (z) {
  console.log(`Zombie at ${lib.fmt(z.position)}, dist=${bot.entity.position.distanceTo(z.position).toFixed(1)}m`);
  
  // Check if we can path towards it
  const movements = new Movements(bot, mcData);
  movements.canDig = true;
  bot.pathfinder.setMovements(movements);
  
  try {
    console.log('Pathfinding towards zombie...');
    await bot.pathfinder.goto(new goals.GoalNear(z.position.x, z.position.y, z.position.z, 2));
    console.log('Reached near zombie! Pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Cannot reach zombie:', e.message);
  }
}

console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Health:', bot.health);
