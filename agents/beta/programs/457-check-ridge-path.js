// programs/457-check-ridge-path.js
console.log('=== Step: Inspect Ridge Path South ===');
console.log('Current pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Check if doorway is open
const p1 = new Vec3(44, 65, -128);
const p2 = new Vec3(44, 66, -128);
const b1 = bot.blockAt(p1);
const b2 = bot.blockAt(p2);
console.log(`Doorway blocks: (44,65,-128)=${b1?.name}, (44,66,-128)=${b2?.name}`);

// Check path towards (45, 65, -120) and (47, 65, -110)
const waypoints = [
  new Vec3(45, 65, -125),
  new Vec3(45, 65, -120),
  new Vec3(47, 65, -110),
  new Vec3(50, 65, -95),
  new Vec3(54, 64, -67),
  new Vec3(55, 65, -35),
  new Vec3(48, 65, -7),
  new Vec3(40.5, 65.0, -7.0)
];

for (const wp of waypoints) {
  const floor = bot.blockAt(wp.offset(0, -1, 0));
  const feet = bot.blockAt(wp);
  const head = bot.blockAt(wp.offset(0, 1, 0));
  console.log(`WP ${lib.fmt(wp)}: floor=${floor?.name}, feet=${feet?.name}, head=${head?.name}`);
}

// Check hostiles around
for (const e of Object.values(bot.entities)) {
  if (e.type === 'mob') {
    const d = bot.entity.position.distanceTo(e.position);
    if (d < 35) {
      console.log(`Mob nearby: ${e.name} at ${lib.fmt(e.position)} dist=${d.toFixed(1)}m`);
    }
  }
}
