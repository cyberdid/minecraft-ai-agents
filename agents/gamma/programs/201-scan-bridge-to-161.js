// programs/201-scan-bridge-to-161.js
console.log('--- SCAN BRIDGE TO Z=-161 & BLAZE STATUS ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);

// Locate all Blazes within 24m
const blazes = Object.values(bot.entities).filter(e => e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 24);
console.log(`Found ${blazes.length} blazes nearby:`);
for (const b of blazes) {
  console.log(`  Blaze id=${b.id} at ${lib.fmt(b.position)} (dist: ${bot.entity.position.distanceTo(b.position).toFixed(1)}m, HP: ${b.health || 20})`);
}

// Check bridge blocks along x=44, y=64..66 from z=-150 to -161
for (let z = -150; z >= -161; z--) {
  const flr = bot.blockAt(new Vec3(44, 64, z));
  const feet = bot.blockAt(new Vec3(44, 65, z));
  const head = bot.blockAt(new Vec3(44, 66, z));
  const R = bot.blockAt(new Vec3(45, 65, z));
  const R2 = bot.blockAt(new Vec3(45, 66, z));
  console.log(`z=${z}: flr=${flr?.name} | feet=${feet?.name} | R(y65)=${R?.name || 'open'} | R(y66)=${R2?.name || 'open'}`);
}

// Check Teammate Delta
if (bot.players.delta?.entity) {
  console.log(`Delta pos: ${lib.fmt(bot.players.delta.entity.position)}`);
}
