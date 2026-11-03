// programs/509-inspect-tunnel-ahead.js
console.log('=== GAMMA: INSPECT TUNNEL AHEAD ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Inspect blocks along x=44, y=64..66 from z=-144 to z=-160
const report = [];
for (let z = -144; z >= -160; z--) {
  const floor = bot.blockAt(new Vec3(44, 64, z));
  const body = bot.blockAt(new Vec3(44, 65, z));
  const head = bot.blockAt(new Vec3(44, 66, z));
  const roof = bot.blockAt(new Vec3(44, 67, z));
  const westWall = bot.blockAt(new Vec3(43, 65, z));
  const eastWall = bot.blockAt(new Vec3(45, 65, z));

  report.push({
    z,
    floor: floor ? floor.name : 'null',
    body: body ? body.name : 'null',
    head: head ? head.name : 'null',
    roof: roof ? roof.name : 'null',
    westWall: westWall ? westWall.name : 'null',
    eastWall: eastWall ? eastWall.name : 'null'
  });
}

console.log('Walkway inspection z=-144 to -160:');
for (const r of report) {
  const isSolidFloor = r.floor !== 'air' && r.floor !== 'null';
  console.log(`z=${r.z}: floor=${r.floor} (${isSolidFloor ? 'SAFE' : '*** GAP/AIR ***'}) | body=${r.body} | west=${r.westWall}`);
}

// Also check for any entities nearby
const nearby = Object.values(bot.entities).filter(e =>
  e && e.isValid && bot.entity.position.distanceTo(e.position) <= 20
).map(e => `${e.name || e.username} at ${lib.fmt(e.position)}`);
console.log('Entities within 20m:', nearby.join('; ') || 'none');

return { report };
