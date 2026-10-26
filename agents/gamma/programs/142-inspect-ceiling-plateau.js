// programs/142-inspect-ceiling-plateau.js
console.log('--- INSPECT CEILING PLATEAU AT Y=70 ---');
console.log('Pos:', lib.fmt(bot.entity.position));

const p = bot.entity.position.floored();
console.log(`Standing at floored: ${lib.fmt(p)}`);

// Scan 5x5 around Gamma at y=69 (floor), y=70 (feet), y=71 (head), y=72 (roof)
for (let y = 69; y <= 72; y++) {
  console.log(`--- Layer y=${y} ---`);
  for (let dz = 2; dz >= -3; dz--) {
    let row = `z=${p.z + dz}: `;
    for (let dx = -2; dx <= 2; dx++) {
      const b = bot.blockAt(p.offset(dx, y - p.y, dz));
      row += `[${b ? b.name.slice(0, 4) : 'null'}] `;
    }
    console.log(row);
  }
}

// Check distance to Blaze Spawner (32, 68, -190)
const spawnerPos = new Vec3(32, 68, -190);
const dist = bot.entity.position.distanceTo(spawnerPos);
console.log(`Distance to Blaze Spawner at (32, 68, -190): ${dist.toFixed(1)}m`);
console.log(`Delta X = ${spawnerPos.x - p.x}, Delta Y = ${spawnerPos.y - p.y}, Delta Z = ${spawnerPos.z - p.z}`);

// Check teammates
for (const [name, player] of Object.entries(bot.players)) {
  if (name !== 'gamma' && player.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(player.entity.position)} dist=${player.entity.position.distanceTo(bot.entity.position).toFixed(1)}`);
  }
}
