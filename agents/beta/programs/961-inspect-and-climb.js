console.log('=== Program 961: Inspect Cave Surroundings ===');
globalThis.isProgramCancelled = isCancelled;

const p = bot.entity.position;
const bx = Math.floor(p.x);
const by = Math.floor(p.y);
const bz = Math.floor(p.z);
console.log(`Bot pos: ${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`);

for (let dy = -1; dy <= 3; dy++) {
  const line = [];
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      const b = bot.blockAt(new Vec3(bx + dx, by + dy, bz + dz));
      if (b && b.name !== 'air' && b.name !== 'cave_air' && b.name !== 'water') {
        line.push(`${dx},${dz}:${b.name}`);
      }
    }
  }
  console.log(`dy=${dy}: ${line.join(' ')}`);
}

// Find path out or allow canDig for pathfinder
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

console.log('Trying pathfind to (293, 72, -56) with canDig=true...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 1.5));
  console.log('Arrived at Base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Pathfind error with canDig=true:', e.message);
}

return {
  pos: bot.entity.position
};
