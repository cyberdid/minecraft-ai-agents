const blocks = [];
for (let dx = -8; dx <= 8; dx++) {
  for (let dy = -2; dy <= 4; dy++) {
    for (let dz = -8; dz <= 8; dz++) {
      const p = bot.entity.position.floored().offset(dx, dy, dz);
      const b = bot.blockAt(p);
      if (b && (b.name === 'grass_block' || b.name === 'dirt' || b.name === 'sand')) {
        const bAbove = bot.blockAt(p.offset(0, 1, 0));
        if (bAbove && bAbove.name === 'air') {
          blocks.push({ pos: p, name: b.name, dist: bot.entity.position.distanceTo(p) });
        }
      }
    }
  }
}
blocks.sort((a, b) => a.dist - b.dist);
console.log(`Found ${blocks.length} walkable shore blocks nearby.`);
for (let i = 0; i < Math.min(5, blocks.length); i++) {
  console.log(`  ${blocks[i].name} at ${blocks[i].pos}, dist ${blocks[i].dist.toFixed(1)}m`);
}
