// programs/680-inspect-immediate-surroundings.js
console.log("Gamma at:", lib.fmt(bot.entity.position));
for (let dx = -3; dx <= 3; dx++) {
  for (let dz = -3; dz <= 3; dz++) {
    const p = bot.entity.position.offset(dx, 0, dz);
    const b = bot.blockAt(p);
    const below = bot.blockAt(p.offset(0, -1, 0));
    const above = bot.blockAt(p.offset(0, 1, 0));
    console.log(`offset(${dx}, ${dz}) [${Math.floor(p.x)}, ${Math.floor(p.y)}, ${Math.floor(p.z)}]: below=${below?.name}, at=${b?.name}, above=${above?.name}`);
  }
}
const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
console.log("Found portals:", portals.length);
for (const p of portals) {
  console.log("Portal block at:", lib.fmt(p));
}
return { pos: bot.entity.position, portals: portals.length };
