// programs/363-inspect-and-box-spawner.js
console.log('=== INSPECT & FORTIFY SPAWNER BALCONY ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Cobblestone:', lib.count('cobblestone'));

// Survey blocks towards spawner
for (let y = 66; y <= 69; y++) {
  for (let z = -187; z >= -191; z--) {
    let line = `y=${y}, z=${z}: `;
    for (let x = 31; x <= 36; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      line += `[x=${x}:${b ? b.name : 'null'}] `;
    }
    console.log(line);
  }
}

// Check spawner block specifically
const spawnerPos = new Vec3(32, 68, -190);
const spawnerBlock = bot.blockAt(spawnerPos);
console.log('Spawner block at (32, 68, -190):', spawnerBlock ? spawnerBlock.name : 'none');

// Advance floor at y=66 / y=67 towards (33, 67, -188)
const floorBlocks = [
  new Vec3(34, 65, -187),
  new Vec3(34, 66, -187),
  new Vec3(34, 66, -188),
  new Vec3(33, 66, -188),
  new Vec3(33, 66, -189)
];

for (const fp of floorBlocks) {
  const b = bot.blockAt(fp);
  if (!b || b.boundingBox !== 'block') {
    if (lib.count('cobblestone') > 0) {
      console.log(`Placing floor cobblestone at ${lib.fmt(fp)}...`);
      try {
        await lib.place('cobblestone', fp.x, fp.y, fp.z);
      } catch (e) {
        console.log(`Floor place note at ${lib.fmt(fp)}:`, e.message);
      }
    }
  }
}

// Step closer to spawner to (33.5, 67, -188.5)
try {
  await lib.goTo(33.5, 67, -188.5, 1, { timeoutMs: 5000 });
} catch (e) {
  try { await lib.goToXZ(33.5, -188.5, { timeoutMs: 4000 }); } catch (e2) {}
}

console.log('Current combat position:', lib.fmt(bot.entity.position));

// Build blast wall at (32, 67..68, -189)
const shieldWall = [
  new Vec3(33, 67, -190),
  new Vec3(34, 67, -190),
  new Vec3(33, 69, -190) // roof block above firing slit
];

for (const sw of shieldWall) {
  const b = bot.blockAt(sw);
  if (!b || b.boundingBox !== 'block') {
    if (lib.count('cobblestone') > 0) {
      try {
        await lib.place('cobblestone', sw.x, sw.y, sw.z);
        console.log(`Placed shield wall at ${lib.fmt(sw)}!`);
      } catch (e) {}
    }
  }
}

// Combat loop
await lib.equipWeapon();
const start = Date.now();
let rodsBefore = lib.count('blaze_rod');

while (Date.now() - start < 35000 && !isCancelled()) {
  if (bot.health <= 12) {
    try { await lib.eat(); } catch (e) {}
  }

  // Attack any Blaze within 4m
  const blazes = Object.values(bot.entities)
    .filter(e => e && e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 4.5)
    .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

  if (blazes.length > 0) {
    const b = blazes[0];
    await bot.lookAt(b.position.offset(0, b.height * 0.5, 0));
    bot.attack(b);
    await sleep(550);
    await lib.pickup(5);
  } else {
    await lib.pickup(5);
    await sleep(600);
  }

  const rodsNow = lib.count('blaze_rod');
  if (rodsNow > rodsBefore) {
    console.log(`*** HARVESTED BLAZE ROD! TOTAL: ${rodsNow} ***`);
    bot.chat(`gamma: harvested Blaze Rod! Total: ${rodsNow}`);
    rodsBefore = rodsNow;
  }
}

console.log('Finished. Rods:', lib.count('blaze_rod'), 'HP:', bot.health, 'Pos:', lib.fmt(bot.entity.position));
