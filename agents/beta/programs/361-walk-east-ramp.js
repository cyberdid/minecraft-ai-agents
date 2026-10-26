// programs/361-walk-east-ramp.js
console.log('=== Walk up east ramp from y=27 to y=36 ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

const steps = [
  [306, 30, -41],
  [308, 32, -41],
  [310, 34, -41],
  [312, 36, -41]
];

for (const [x, y, z] of steps) {
  try {
    await lib.goTo(x, y, z, 1, { timeoutMs: 8000 });
    console.log(`Reached (${x}, ${y}, ${z}) -> pos: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Step (${x}, ${y}, ${z}) note:`, e.message);
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position));

// Inspect air blocks around y=36..48 at new pos
const p = bot.entity.position.floored();
console.log('Inspecting upwards from', p);
for (let y = p.y; y <= p.y + 12; y++) {
  let line = `y=${y}: `;
  for (let dz = -3; dz <= 3; dz++) {
    for (let dx = -3; dx <= 3; dx++) {
      const b = bot.blockAt(new Vec3(p.x + dx, y, p.z + dz));
      if (b && (b.name === 'air' || b.name === 'cave_air')) {
        line += `(${p.x + dx},${p.z + dz}) `;
      }
    }
  }
  console.log(line);
}
