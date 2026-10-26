// programs/006-survey.js
const p = bot.entity.position.floored();
console.log('gamma at:', lib.fmt(p));
const blocks = [];
for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    for (let dy = -1; dy <= 2; dy++) {
      const b = bot.blockAt(p.offset(dx, dy, dz));
      if (b && b.name !== 'air') {
        blocks.push(`${dx},${dy},${dz}: ${b.name}`);
      }
    }
  }
}
console.log('Surrounding blocks:\n' + blocks.join('\n'));
return p;
