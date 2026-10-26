// programs/531-check-surroundings-and-move.js
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Creeper position
const hostiles = lib.hostiles(16);
console.log('Hostiles:', hostiles.map(h => `${h.name} at ${lib.fmt(h.pos)} (${h.dist.toFixed(1)}m)`));

// Scan 3x3 around feet and head
const p = bot.entity.position.floored();
console.log('Blocks around feet (y=' + p.y + '):');
for (let dx = -1; dx <= 1; dx++) {
  for (let dz = -1; dz <= 1; dz++) {
    const b = bot.blockAt(p.offset(dx, 0, dz));
    const bUp = bot.blockAt(p.offset(dx, 1, dz));
    const bDown = bot.blockAt(p.offset(dx, -1, dz));
    console.log(`(${p.x+dx}, ${p.z+dz}): down=${bDown?.name}, feet=${b?.name}, head=${bUp?.name}`);
  }
}

// If creeper is close, move in opposite direction of creeper!
if (hostiles.length > 0) {
  const creeper = hostiles.find(h => h.name === 'creeper') || hostiles[0];
  const cPos = creeper.pos;
  const awayDir = bot.entity.position.minus(cPos).normalize();
  console.log(`Creeper at ${lib.fmt(cPos)}, moving away vector:`, awayDir);
  
  // Try lib.goTo towards base (294, 72, -54)
  try {
    await lib.goTo(294, 72, -54, 2, { dig: true });
    console.log('lib.goTo success! Pos:', lib.fmt(bot.entity.position));
  } catch (err) {
    console.log('lib.goTo error:', err.message);
    // If blocked, try jumping away from creeper
    await bot.lookAt(bot.entity.position.plus(awayDir.scaled(5)), true);
    bot.setControlState('forward', true);
    bot.setControlState('jump', true);
    await sleep(1500);
    bot.clearControlStates();
    console.log('Jumped to:', lib.fmt(bot.entity.position));
  }
}
