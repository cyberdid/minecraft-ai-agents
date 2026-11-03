console.log('=== RETURN TO BASE PORTAL ===');
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

await bot.pathfinder.goto(new goals.GoalNear(299.0, 73.0, -52.0, 1.0));
console.log('Arrived at portal frame:', lib.fmt(bot.entity.position));

// Check nearby players
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
for (const p of players) {
  console.log(`Player ${p.username}: pos=${lib.fmt(p.position)}, held=${p.heldItem ? p.heldItem.name : 'empty'}`);
}

// Check portal sill and portal block
const sill = bot.blockAt(new Vec3(299, 72, -54));
const pBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
console.log(`Sill: ${sill?.name}, Portal: ${pBlock ? 'ACTIVE' : 'inactive'}`);
