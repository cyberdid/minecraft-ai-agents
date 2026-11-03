// programs/692-inspect-blocks-z2-to-z6.js
console.log('Gamma at:', lib.fmt(bot.entity.position));

for (let z = 1; z <= 7; z++) {
  for (let x = 45; x <= 47; x++) {
    const b64 = bot.blockAt(new Vec3(x, 64, z))?.name;
    const b65 = bot.blockAt(new Vec3(x, 65, z))?.name;
    const b66 = bot.blockAt(new Vec3(x, 66, z))?.name;
    console.log(`(${x}, ${z}): y64=${b64}, y65=${b65}, y66=${b66}`);
  }
}
const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 10 });
console.log('Portals nearby:', portals.length);
for (const p of portals) console.log('Portal at:', lib.fmt(p));
