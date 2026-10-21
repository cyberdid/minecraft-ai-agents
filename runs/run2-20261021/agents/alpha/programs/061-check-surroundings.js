const pos = bot.entity.position;
console.log('Pos:', pos);
const under = lib.blockAt(Math.floor(pos.x), Math.floor(pos.y) - 1, Math.floor(pos.z));
console.log('Block under:', under?.name);

// Check 1 block in all horizontal directions
const dirs = [
  { name: '+x (east)', dx: 1, dz: 0 },
  { name: '-x (west)', dx: -1, dz: 0 },
  { name: '+z (south)', dx: 0, dz: 1 },
  { name: '-z (north)', dx: 0, dz: -1 }
];

for (const d of dirs) {
  const feet = lib.blockAt(Math.floor(pos.x) + d.dx, Math.floor(pos.y), Math.floor(pos.z) + d.dz);
  const head = lib.blockAt(Math.floor(pos.x) + d.dx, Math.floor(pos.y) + 1, Math.floor(pos.z) + d.dz);
  const floor = lib.blockAt(Math.floor(pos.x) + d.dx, Math.floor(pos.y) - 1, Math.floor(pos.z) + d.dz);
  console.log(`${d.name}: floor=${floor?.name}, feet=${feet?.name}, head=${head?.name}`);
}
