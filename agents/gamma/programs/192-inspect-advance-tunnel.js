// programs/192-inspect-advance-tunnel.js
console.log('--- INSPECT ADVANCE TUNNEL FROM Z=-140 TO Z=-155 ---');
console.log('Start pos:', lib.fmt(bot.entity.position));

// Check blocks along line x=44, z=-140..-155, y=63..68
for (let z = -140; z >= -155; z--) {
  const under = bot.blockAt(new Vec3(44, 64, z));
  const feet = bot.blockAt(new Vec3(44, 65, z));
  const head = bot.blockAt(new Vec3(44, 66, z));
  const roof = bot.blockAt(new Vec3(44, 67, z));
  const left = bot.blockAt(new Vec3(43, 65, z));
  const right = bot.blockAt(new Vec3(45, 65, z));
  console.log(`z=${z}: flr(y64)=${under?.name || 'AIR!'} | feet=${feet?.name} | head=${head?.name} | roof(y67)=${roof?.name || 'OPEN!'} | L(x43)=${left?.name || 'open'} | R(x45)=${right?.name || 'open'}`);
}

// Check nearby entities (Blazes, items, etc.)
const nearby = Object.values(bot.entities).filter(e => e.position && e.position.distanceTo(bot.entity.position) < 32);
console.log('Nearby entities within 32m:');
for (const e of nearby) {
  if (e !== bot.entity) {
    console.log(`  ${e.name} at ${lib.fmt(e.position)} (dist: ${bot.entity.position.distanceTo(e.position).toFixed(1)}m)`);
  }
}
