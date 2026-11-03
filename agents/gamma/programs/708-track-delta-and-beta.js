// programs/708-track-delta-and-beta.js
for (const [name, p] of Object.entries(bot.players)) {
  if (name === bot.username) continue;
  if (p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  } else {
    console.log(`Teammate ${name} entity not in local tracking.`);
  }
}

// Find open air / cave below
console.log('Scanning column at (2214, y, 1465):');
for (let y = 30; y >= 0; y--) {
  const b = bot.blockAt(new Vec3(2214, y, 1465));
  if (b?.name === 'air' || b?.name === 'cave_air') {
    console.log(`y=${y} is AIR`);
  }
}
