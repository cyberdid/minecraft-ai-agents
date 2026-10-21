const bp = lib.shapes.house({
  x: 10,
  y: 67,
  z: -25,
  width: 5,
  depth: 5,
  height: 3,
  wall: 'sandstone',
  roof: 'sandstone',
  door: 'south',
  windows: true
});

let placed = 0;
const missing = [];
for (const b of bp) {
  const cur = bot.blockAt(new Vec3(b.x, b.y, b.z));
  const isSolid = cur && (cur.name === b.name || (b.y === 70 && (cur.name === 'oak_planks' || cur.name === 'sandstone')));
  if (isSolid) {
    placed++;
  } else {
    missing.push({ x: b.x, y: b.y, z: b.z, expected: b.name, found: cur ? cur.name : 'air' });
  }
}

console.log(`CURRENT VERIFIED PROGRESS: ${placed} / ${bp.length} blocks!`);
console.log('Missing blocks count:', missing.length);
if (missing.length <= 15) {
  console.log('Missing blocks details:', JSON.stringify(missing));
}

const alpha = bot.players.alpha?.entity;
console.log('Alpha pos:', alpha ? lib.fmt(alpha.position) : 'unknown');

// Check door
const door = bot.blockAt(new Vec3(12, 67, -21));
console.log('Door at (12, 67, -21):', door ? door.name : 'none');

return { placed, total: bp.length, missingCount: missing.length };
