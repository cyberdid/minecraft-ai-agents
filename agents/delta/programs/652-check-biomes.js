console.log('=== BIOME & TERRAIN INSPECTION ===');
const pos = bot.entity.position;
const block = bot.blockAt(pos);
console.log(`Delta at ${lib.fmt(pos)}, biome: ${block ? block.biome.name : 'unknown'}`);

// Test biomes at key waypoints
const testPoints = [
  new Vec3(44, 65, -127),
  new Vec3(50, 65, -115),
  new Vec3(61, 66, -100),
  new Vec3(62, 67, -80),
  new Vec3(61.5, 67, -60),
  new Vec3(63, 65, -35),
  new Vec3(63, 64, -7),
  new Vec3(46, 65, -7)
];

for (const tp of testPoints) {
  const b = bot.blockAt(tp);
  console.log(`Point (${tp.x}, ${tp.y}, ${tp.z}): biome = ${b ? b.biome.name : 'loaded? false'}, block = ${b ? b.name : 'none'}`);
}

// Check Gamma's position & Endermen
const gamma = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'gamma');
if (gamma) {
  console.log(`Gamma position: ${lib.fmt(gamma.position)}`);
}
