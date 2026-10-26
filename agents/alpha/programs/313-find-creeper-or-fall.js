// programs/313-find-creeper-or-fall.js
console.log('=== Program 313: Locate Creeper / Skeleton ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health);

const hostiles = Object.values(bot.entities).filter(e => e.type === 'hostile' && bot.entity.position.distanceTo(e.position) < 16);
for (const h of hostiles) {
  console.log(`Hostile: ${h.name} at ${lib.fmt(h.position)}, dist=${bot.entity.position.distanceTo(h.position).toFixed(1)}m`);
}

// Check where the open air is
const pos = bot.entity.position.floored();
for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
  const p = pos.offset(dx, 0, dz);
  console.log(`dir (${dx}, ${dz}) (${lib.fmt(p)}): feet=${bot.blockAt(p)?.name}, below=${bot.blockAt(p.offset(0, -1, 0))?.name}`);
}

// Also check what is below (333, y, -70)
for (let y = 14; y >= 5; y--) {
  const p = new Vec3(333, y, -70);
  console.log(`y=${y}: ${bot.blockAt(p)?.name}`);
}
