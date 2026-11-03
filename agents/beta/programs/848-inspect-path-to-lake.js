// programs/848-inspect-path-to-lake.js
console.log('=== Program 848: Inspect Path to Lava Lake ===');
const p = bot.entity.position;
console.log(`Current pos: ${lib.fmt(p)}`);

for (let x = 293; x >= 284; x--) {
  let line = `x=${x}: `;
  for (let z = 6; z <= 10; z++) {
    for (let y = 19; y >= 17; y--) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'cave_air' && b.name !== 'air') {
        line += `(${y},${z}):${b.name} `;
      }
    }
  }
  console.log(line);
}
