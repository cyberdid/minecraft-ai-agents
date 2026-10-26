// programs/276-scan-frontline-bridge.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Building blocks available:', lib.count('cobblestone') + lib.count('dirt') + lib.count('netherrack') + lib.count('soul_sand'));

bot.pathfinder.stop();

// 1. Scan players nearby
console.log('--- PLAYERS ---');
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist: ${d.toFixed(1)}m)`);
  }
}

// 2. Scan hostiles nearby
console.log('--- HOSTILES ---');
const hostiles = Object.values(bot.entities).filter(e => e.type === 'mob' && bot.entity.position.distanceTo(e.position) < 32);
for (const h of hostiles) {
  console.log(`Hostile ${h.name} at ${lib.fmt(h.position)} (dist: ${bot.entity.position.distanceTo(h.position).toFixed(1)}m)`);
}

// 3. Scan floor and walls along x=44 and x=43 from z=-167 to z=-180
console.log('--- WALKWAY SCAN (z=-167 to -180) ---');
for (let z = -167; z >= -180; z--) {
  const f44 = bot.blockAt(new Vec3(44, 64, z))?.name || 'none';
  const w43_65 = bot.blockAt(new Vec3(43, 65, z))?.name || 'none';
  const w43_66 = bot.blockAt(new Vec3(43, 66, z))?.name || 'none';
  const r44_67 = bot.blockAt(new Vec3(44, 67, z))?.name || 'none';
  console.log(`z=${z}: floor(44,64)=${f44} west(43,65)=${w43_65} west(43,66)=${w43_66} roof(44,67)=${r44_67}`);
}

// 4. Check bridge blocks past z=-175 angling towards Spawner at (32, 68, -190)
console.log('--- SPONSORED BRIDGE TO SPAWNER ---');
for (let z = -175; z >= -190; z--) {
  for (let x = 30; x <= 44; x++) {
    for (let y = 64; y <= 69; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air' && b.name !== 'netherrack') {
        console.log(`Block at (${x}, ${y}, ${z}): ${b.name}`);
      }
    }
  }
}
