// programs/707-inspect-current-cavern.js
console.log('Gamma at:', lib.fmt(bot.entity.position));

for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    const p = bot.entity.position.offset(dx, 0, dz);
    const below = bot.blockAt(p.offset(0, -1, 0))?.name;
    const feet = bot.blockAt(p)?.name;
    const head = bot.blockAt(p.offset(0, 1, 0))?.name;
    console.log(`offset(${dx}, ${dz}) [${Math.floor(p.x)}, ${Math.floor(p.z)}]: below=${below}, feet=${feet}, head=${head}`);
  }
}
