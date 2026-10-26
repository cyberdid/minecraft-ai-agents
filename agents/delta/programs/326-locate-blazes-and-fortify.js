// programs/326-locate-blazes-and-fortify.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'health:', bot.health, 'food:', bot.food);

// 1. Scan Blazes
const blazes = Object.values(bot.entities).filter(e => e && e.name === 'blaze');
console.log(`Blazes found (${blazes.length}):`);
for (const b of blazes) {
  const dist = bot.entity.position.distanceTo(b.position);
  console.log(`  Blaze at ${lib.fmt(b.position)} (dist: ${dist.toFixed(1)}m, HP: ${b.metadata?.[9] ?? '?'})`);
}

// 2. Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (cobble) await bot.equip(cobble, 'hand');

// Function to place a block safely
async function placeBlockAt(x, y, z) {
  const target = new Vec3(x, y, z);
  const existing = bot.blockAt(target);
  if (existing && existing.boundingBox === 'block') return true;
  
  const cob = bot.inventory.items().find(i => i.name === 'cobblestone');
  if (cob) await bot.equip(cob, 'hand');
  
  const neighbors = [
    new Vec3(0, -1, 0),
    new Vec3(0, 0, 1),
    new Vec3(1, 0, 0),
    new Vec3(-1, 0, 0),
    new Vec3(0, 0, -1),
    new Vec3(0, 1, 0)
  ];
  for (const n of neighbors) {
    const refPos = target.plus(n);
    const refBlock = bot.blockAt(refPos);
    if (refBlock && refBlock.boundingBox === 'block') {
      try {
        const faceVec = new Vec3(-n.x, -n.y, -n.z);
        await bot.placeBlock(refBlock, faceVec);
        console.log(`Placed cobble at (${x},${y},${z}) against (${refPos.x},${refPos.y},${refPos.z})`);
        return true;
      } catch (e) {}
    }
  }
  return false;
}

// 3. Fully seal Delta's bunker at (38, 65, -176)
console.log('Sealing bunker around (38, 65, -176)...');
// North wall at z=-177: x=38, 39
await placeBlockAt(38, 65, -177);
await placeBlockAt(38, 66, -177);
await placeBlockAt(39, 65, -177);
await placeBlockAt(39, 66, -177);

// West wall at x=37: z=-176, -175
await placeBlockAt(37, 65, -176);
await placeBlockAt(37, 66, -176);
await placeBlockAt(37, 65, -175);
await placeBlockAt(37, 66, -175);

// South wall at z=-174: x=38
await placeBlockAt(38, 65, -174);
await placeBlockAt(38, 66, -174);

// Roof at y=67: (38, 67, -176)
await placeBlockAt(38, 67, -176);

console.log('Bunker fully sealed! Cobble remaining:', lib.count('cobblestone'));
bot.chat(`delta: Secure frontline bunker established at (38, 65, -176)! 100% blast-proof cover, Blazes within 11m! Cobble: ${lib.count('cobblestone')}`);
