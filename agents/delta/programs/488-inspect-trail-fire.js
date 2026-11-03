// programs/488-inspect-trail-fire.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// Check for fire and soul_fire blocks
const fires = bot.findBlocks({
  matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
  maxDistance: 24,
  count: 20
});

console.log(`Found ${fires.length} fire/soul_fire blocks nearby:`);
for (const fp of fires) {
  const b = bot.blockAt(fp);
  console.log(`- ${b.name} at ${lib.fmt(fp)} (dist: ${bot.entity.position.distanceTo(fp).toFixed(1)}m)`);
}

// Check floor blocks along x=63 from z=-2 to z=-20
for (let z = -2; z >= -20; z -= 2) {
  const floor = bot.blockAt(new Vec3(63, 64, z));
  const waist = bot.blockAt(new Vec3(63, 65, z));
  const head = bot.blockAt(new Vec3(63, 66, z));
  console.log(`z=${z}: floor=${floor?.name}, waist=${waist?.name}, head=${head?.name}`);
}

return { fires: fires.length };
