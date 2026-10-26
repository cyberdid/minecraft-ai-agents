// programs/273-check-zombie-path.js
console.log('=== Program 273: Check Zombie Position & Distance ===');
const p = bot.entity.position;
const mobs = Object.values(bot.entities).filter(e => e.type === 'mob' && e.name === 'zombie');

for (const m of mobs) {
  const d = p.distanceTo(m.position);
  console.log(`Zombie at ${lib.fmt(m.position)}, dist=${d.toFixed(1)}m`);
}

// Check where the open air towards the zombie is
if (mobs.length > 0) {
  const z = mobs[0];
  console.log(`Heading towards zombie at ${lib.fmt(z.position)}...`);
  try {
    const movements = new Movements(bot, mcData);
    movements.canDig = false;
    bot.pathfinder.setMovements(movements);
    await bot.pathfinder.goto(new goals.GoalNear(z.position.x, z.position.y, z.position.z, 1));
  } catch (e) {
    console.log('Cannot path directly to zombie:', e.message);
  }
}
