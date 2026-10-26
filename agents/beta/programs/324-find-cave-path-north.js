// programs/324-find-cave-path-north.js
console.log('=== Inspect cave towards North (z < 2) ===');
const p = bot.entity.position.floored();
console.log('Beta floored pos:', p);

// Check blocks in front (towards negative z)
for (let dz = -1; dz >= -6; dz--) {
  let line = `dz=${dz} (z=${p.z + dz}): `;
  for (let dy = -1; dy <= 2; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const b = bot.blockAt(p.offset(dx, dy, dz));
      const name = b ? b.name : 'null';
      if (name === 'air' || name === 'cave_air') {
        line += `[air at dy=${dy},dx=${dx}] `;
      }
    }
  }
  console.log(line);
}

// Also check if there is air above (towards surface)
for (let dy = 1; dy <= 10; dy++) {
  const b = bot.blockAt(p.offset(0, dy, 0));
  console.log(`dy=${dy} (y=${p.y + dy}): ${b ? b.name : 'null'}`);
}
