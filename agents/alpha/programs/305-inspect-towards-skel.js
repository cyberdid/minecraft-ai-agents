// programs/305-inspect-towards-skel.js
console.log('=== Program 305: Blocks towards Skeleton ===');
const alphaPos = bot.entity.position.floored();
console.log('Alpha at:', lib.fmt(alphaPos));

for (let dx = 1; dx <= 3; dx++) {
  const p = alphaPos.offset(dx, 0, 0);
  console.log(`+X dx=${dx} (${lib.fmt(p)}): feet=${bot.blockAt(p)?.name}, head=${bot.blockAt(p.offset(0, 1, 0))?.name}, below=${bot.blockAt(p.offset(0, -1, 0))?.name}`);
}

// Is skeleton still there?
const skel = Object.values(bot.entities).find(e => e.name === 'skeleton' && bot.entity.position.distanceTo(e.position) < 16);
if (skel) {
  console.log(`Skeleton at ${lib.fmt(skel.position)}, dist=${bot.entity.position.distanceTo(skel.position).toFixed(1)}m`);
} else {
  console.log('No skeleton within 16m');
}
