// programs/702-locate-end-portal-frames.js
console.log('=== END PORTAL ROOM SCAN AROUND SPAWNER (2229, 12, 1457) ===');

const center = new Vec3(2229, 12, 1457);
const frames = [];

for (let dx = -6; dx <= 6; dx++) {
  for (let dy = -2; dy <= 6; dy++) {
    for (let dz = -6; dz <= 6; dz++) {
      const p = center.offset(dx, dy, dz);
      const b = bot.blockAt(p);
      if (b && (b.name === 'end_portal_frame' || b.name === 'end_portal' || b.name === 'spawner' || b.name === 'lava')) {
        frames.push({ name: b.name, pos: p, eye: b._properties?.eye });
        console.log(`Found ${b.name} at ${lib.fmt(p)}${b.name === 'end_portal_frame' ? ` [eye=${b._properties?.eye}]` : ''}`);
      }
    }
  }
}

console.log(`Total key blocks found: ${frames.length}`);
return { count: frames.length, frames };
