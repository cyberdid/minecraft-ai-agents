// programs/368-inspect-exact-surroundings.js
console.log('=== Inspect exact surroundings of beta ===');
console.log('Exact pos:', bot.entity.position);
console.log('onGround:', bot.entity.onGround);

const bx = Math.floor(bot.entity.position.x);
const by = Math.floor(bot.entity.position.y);
const bz = Math.floor(bot.entity.position.z);

for (let dy = -1; dy <= 2; dy++) {
  console.log(`--- dy = ${dy} (y = ${by + dy}) ---`);
  for (let dz = -1; dz <= 1; dz++) {
    let row = `dz=${dz} (z=${bz + dz}): `;
    for (let dx = -1; dx <= 1; dx++) {
      const b = bot.blockAt(new Vec3(bx + dx, by + dy, bz + dz));
      row += `dx=${dx}:${b ? b.name : 'null'} `;
    }
    console.log(row);
  }
}
