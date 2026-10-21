// programs/066-check-spot.js
// Check neighbours of (293, 72, -57) to see what is solid
const target = new Vec3(293, 72, -57);
const offsets = [
  { name: 'below (y-1)', v: new Vec3(0, -1, 0) },
  { name: 'above (y+1)', v: new Vec3(0, 1, 0) },
  { name: 'north (z-1)', v: new Vec3(0, 0, -1) },
  { name: 'south (z+1)', v: new Vec3(0, 0, 1) },
  { name: 'west (x-1)', v: new Vec3(-1, 0, 0) },
  { name: 'east (x+1)', v: new Vec3(1, 0, 0) },
];

for (const o of offsets) {
  const p = target.plus(o.v);
  const b = bot.blockAt(p);
  console.log(`${o.name} at ${p}: ${b ? b.name : 'null'} (solid=${b ? b.boundingBox === 'block' : false})`);
}
