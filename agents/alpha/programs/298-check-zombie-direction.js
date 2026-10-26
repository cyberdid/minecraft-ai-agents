// programs/298-check-zombie-direction.js
console.log('=== Program 298: Check Zombie Direction & Dig Ahead ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

const hostiles = Object.values(bot.entities).filter(e => e.type === 'hostile' && bot.entity.position.distanceTo(e.position) < 16);
for (const h of hostiles) {
  console.log(`Hostile: ${h.name} at ${lib.fmt(h.position)}, dist=${bot.entity.position.distanceTo(h.position).toFixed(1)}m`);
}

// Check blocks at z=-67
const pAhead = new Vec3(336, 22, -67);
console.log('Ahead feet (336, 22, -67):', bot.blockAt(pAhead)?.name);
console.log('Ahead head (336, 23, -67):', bot.blockAt(pAhead.offset(0, 1, 0))?.name);

// Check teammates
for (const name of ['beta', 'gamma', 'delta']) {
  const p = bot.players[name]?.entity;
  if (p) {
    console.log(`Player ${name} at ${lib.fmt(p.position)}, held=${p.heldItem?.name}`);
  }
}
