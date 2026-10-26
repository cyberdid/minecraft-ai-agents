// programs/329-inspect-at-y16.js
console.log('=== Inspect surroundings at (294, 16, 2) and locate Delta ===');
const pos = bot.entity.position;
console.log('Beta pos:', pos);

// Check players nearby
for (const id in bot.entities) {
  const e = bot.entities[id];
  if (e && e.type === 'player' && e.username !== bot.username) {
    console.log(`Player ${e.username} at ${lib.fmt(e.position)}, dist: ${pos.distanceTo(e.position).toFixed(1)}m`);
  }
}

// Check blocks in 5x5 area around Beta at y=15..18
const bx = Math.floor(pos.x);
const by = Math.floor(pos.y);
const bz = Math.floor(pos.z);

console.log('Floor at y=15:');
for (let dz = -2; dz <= 2; dz++) {
  let row = `dz=${dz}: `;
  for (let dx = -2; dx <= 2; dx++) {
    const b = bot.blockAt(new Vec3(bx + dx, by - 1, bz + dz));
    row += `${b ? b.name : 'null'} `;
  }
  console.log(row);
}

console.log('Level at y=16:');
for (let dz = -2; dz <= 2; dz++) {
  let row = `dz=${dz}: `;
  for (let dx = -2; dx <= 2; dx++) {
    const b = bot.blockAt(new Vec3(bx + dx, by, bz + dz));
    row += `${b ? b.name : 'null'} `;
  }
  console.log(row);
}

console.log('Level at y=17:');
for (let dz = -2; dz <= 2; dz++) {
  let row = `dz=${dz}: `;
  for (let dx = -2; dx <= 2; dx++) {
    const b = bot.blockAt(new Vec3(bx + dx, by + 1, bz + dz));
    row += `${b ? b.name : 'null'} `;
  }
  console.log(row);
}
