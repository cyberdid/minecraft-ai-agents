// programs/695-inspect-spawner-frontline.js
console.log('=== Program 695: Inspect Spawner Frontline ===');
console.log('Beta Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 1. Inspect all entities
const entities = Object.values(bot.entities).filter(e => e.isValid && bot.entity.position.distanceTo(e.position) <= 20);
console.log(`Entities within 20m (${entities.length}):`);
for (const e of entities) {
  if (e.id === bot.entity.id) continue;
  console.log(`- ${e.name || e.username} at ${lib.fmt(e.position)}, dist: ${bot.entity.position.distanceTo(e.position).toFixed(1)}m, hp: ${e.health}`);
}

// 2. Inspect blocks from x=32 to 38, y=65 to 69, z=-185 to -191
console.log('Floor blocks at y=65:');
for (let z = -185; z >= -191; z--) {
  let line = `z=${z}: `;
  for (let x = 32; x <= 38; x++) {
    const b = bot.blockAt(new Vec3(x, 65, z));
    line += `x${x}:${b ? b.name.slice(0, 4) : 'air'} `;
  }
  console.log(line);
}

console.log('Blocks at y=66 (player feet / breastwork):');
for (let z = -185; z >= -191; z--) {
  let line = `z=${z}: `;
  for (let x = 32; x <= 38; x++) {
    const b = bot.blockAt(new Vec3(x, 66, z));
    line += `x${x}:${b ? b.name.slice(0, 4) : 'air'} `;
  }
  console.log(line);
}

console.log('Blocks at y=67 (player eye / firing slit):');
for (let z = -185; z >= -191; z--) {
  let line = `z=${z}: `;
  for (let x = 32; x <= 38; x++) {
    const b = bot.blockAt(new Vec3(x, 67, z));
    line += `x${x}:${b ? b.name.slice(0, 4) : 'air'} `;
  }
  console.log(line);
}

console.log('Blocks at y=68 (roof / upper deck):');
for (let z = -185; z >= -191; z--) {
  let line = `z=${z}: `;
  for (let x = 32; x <= 38; x++) {
    const b = bot.blockAt(new Vec3(x, 68, z));
    line += `x${x}:${b ? b.name.slice(0, 4) : 'air'} `;
  }
  console.log(line);
}
