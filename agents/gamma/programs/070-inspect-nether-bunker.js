// programs/070-inspect-nether-bunker.js
console.log('--- NETHER BUNKER INSPECTION ---');
console.log('Gamma pos:', lib.fmt(bot.entity.position));
console.log('Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Check nearby players
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma') {
    if (p.entity) {
      console.log(`Player ${name} visible at: ${lib.fmt(p.entity.position)}, dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}`);
    } else {
      console.log(`Player ${name} not visible / out of render range`);
    }
  }
}

// 2. Check blocks around bunker
const pos = bot.entity.position.floored();
console.log('Scanning 5x5x5 around bunker...');
let chests = [];
let portals = [];
let cobbleCount = 0;

for (let dx = -4; dx <= 4; dx++) {
  for (let dy = -2; dy <= 4; dy++) {
    for (let dz = -4; dz <= 4; dz++) {
      const b = bot.blockAt(pos.offset(dx, dy, dz));
      if (!b) continue;
      if (b.name === 'chest') chests.push(b.position);
      if (b.name === 'nether_portal') portals.push(b.position);
      if (b.name === 'cobblestone' || b.name === 'cobbled_deepslate') cobbleCount++;
    }
  }
}

console.log(`Bunker has ${portals.length} portal blocks, ${cobbleCount} protective cobblestone blocks, ${chests.length} chests`);

// 3. If there is a chest in bunker, inspect it
for (const cp of chests) {
  try {
    const contents = await lib.chestContents(cp.x, cp.y, cp.z);
    console.log(`Bunker chest at ${lib.fmt(cp)}:`, JSON.stringify(contents));
  } catch (e) {
    console.log(`Bunker chest error at ${lib.fmt(cp)}:`, e.message);
  }
}

// 4. Hostiles within 24m
const hostiles = lib.hostiles(24);
console.log('Hostiles within 24:', JSON.stringify(hostiles));

bot.chat(`gamma at Nether bunker (40, 65, -7). Fortress located at (45, 53, -116)! Ready to assist.`);
