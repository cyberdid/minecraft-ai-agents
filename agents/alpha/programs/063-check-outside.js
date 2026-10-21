// programs/063-check-outside.js
// Check trees outside and check portal area at (298, 72, -54)

const logs = lib.find('*_log', { maxDistance: 32, count: 5 });
console.log('Found logs:', logs.map(b => `${b.name} at ${lib.fmt(b.position)}`));

// Check ground at planned portal site: (298, 72, -54)
for (let dx = 0; dx < 4; dx++) {
  for (let dz = -1; dz <= 1; dz++) {
    const p = new Vec3(298 + dx, 72, -54 + dz);
    const b = bot.blockAt(p);
    const below = bot.blockAt(p.offset(0, -1, 0));
    console.log(`Portal site (${p.x}, ${p.y}, ${p.z}): block=${b ? b.name : 'null'}, below=${below ? below.name : 'null'}`);
  }
}
