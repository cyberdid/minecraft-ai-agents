// programs/773-inspect-surroundings.js
console.log('=== Program 773: Inspect Blocks Around Beta ===');
console.log('Beta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

const p = bot.entity.position.floored();
for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    for (let dy = -1; dy <= 2; dy++) {
      const pos = p.offset(dx, dy, dz);
      const b = bot.blockAt(pos);
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        console.log(`Block at ${lib.fmt(pos)}: ${b.name}`);
      }
    }
  }
}

// Find path from bot to (46, 65, -7)
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

console.log('Attempting to walk to (46, 65, -7) with canDig=true...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(46, 65, -7, 1.0));
  console.log('Arrived at WP (46, 65, -7)! New pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Goto error:', e.message);
}

return { pos: bot.entity.position };
