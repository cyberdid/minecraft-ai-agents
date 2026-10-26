// programs/527-scan-corridor-ahead.js
console.log('=== Program 527: Scan Corridor Ahead from z=-161 to -175 ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

for (let z = -161; z >= -175; z--) {
  const f = bot.blockAt(new Vec3(44, 64, z))?.name || 'air';
  const wL = bot.blockAt(new Vec3(43, 65, z))?.name || 'air';
  const cL = bot.blockAt(new Vec3(44, 65, z))?.name || 'air';
  const cU = bot.blockAt(new Vec3(44, 66, z))?.name || 'air';
  console.log(`z=${z}: floor(y=64)=${f}, west(x=43)=${wL}, center_lower=${cL}, center_upper=${cU}`);
}

// Check Blaze Spawner block at (32, 68, -190)
const spawnerBlock = bot.blockAt(new Vec3(32, 68, -190));
console.log('Spawner block at (32, 68, -190):', spawnerBlock ? spawnerBlock.name : 'unloaded/air');

// Check Blazes
const blazes = bot.entities ? Object.values(bot.entities).filter(e => e && e.name === 'blaze') : [];
console.log(`Found ${blazes.length} blazes in world:`);
for (const b of blazes) {
  const d = bot.entity.position.distanceTo(b.position);
  console.log(`  Blaze at ${lib.fmt(b.position)} (dist ${d.toFixed(1)}m)`);
}

// Check Teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'alpha') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}
