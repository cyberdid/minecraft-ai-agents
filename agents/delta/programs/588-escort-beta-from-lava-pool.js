console.log('=== ESCORT BETA FROM LAVA POOL ===');

// Check Beta position
const beta = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'beta');
console.log('Beta pos:', beta ? lib.fmt(beta.position) : 'unknown');

// Configure pathfinder with canDig = true so we can carve path/steps
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

bot.chat('delta: Beta, I am pathfinding to your position (331, 64, -77) to escort you and carve a staircase back to base!');

try {
  await bot.pathfinder.goto(new goals.GoalNear(331.0, 65.0, -75.0, 2.5));
  console.log('Arrived near Beta! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Goto Beta error:', e.message);
}

// Check Beta again
const betaNear = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'beta');
if (betaNear) {
  console.log(`Beta is at ${lib.fmt(betaNear.position)}, distance: ${betaNear.position.distanceTo(bot.entity.position).toFixed(1)}`);
  
  // Inspect blocks around Beta to see if trapped in pit
  const bp = betaNear.position;
  console.log(`Blocks at Beta feet: ${bot.blockAt(bp)?.name}, below: ${bot.blockAt(bp.offset(0, -1, 0))?.name}`);
  for (const [dx, dz] of [[1,0], [-1,0], [0,1], [0,-1]]) {
    const wall1 = bot.blockAt(bp.offset(dx, 0, dz));
    const wall2 = bot.blockAt(bp.offset(dx, 1, dz));
    console.log(`  neighbor (${dx}, ${dz}): y=${wall1?.name}, y+1=${wall2?.name}`);
  }
}

return { pos: bot.entity.position, hp: bot.health };
