// programs/140-mine-netherrack-and-plan-bridge.js
console.log('--- FIND AND MINE NETHERRACK AT Z=-141 ---');
console.log('Pos:', lib.fmt(bot.entity.position));

// Scan solid blocks near us that are safe to dig
// We must NEVER dig the floor at (44, 64, z) or the walls keeping us safe!
// Check above y=67 or to the sides
const safeDigSpots = [];
for (let dx = -2; dx <= 2; dx++) {
  for (let dy = -2; dy <= 5; dy++) {
    for (let dz = -3; dz <= 1; dz++) {
      const p = bot.entity.position.floored().offset(dx, dy, dz);
      // Don't dig our walking path: (44, 64..66, z)
      if (p.x === 44 && (p.y === 64 || p.y === 65 || p.y === 66)) continue;
      // Don't dig our walls: (43 or 45, 65..66, z)
      if ((p.x === 43 || p.x === 45) && (p.y === 65 || p.y === 66)) continue;
      
      const b = bot.blockAt(p);
      if (b && b.name === 'netherrack') {
        safeDigSpots.push(p);
      }
    }
  }
}

console.log(`Found ${safeDigSpots.length} safe netherrack blocks nearby:`, safeDigSpots.slice(0, 10).map(p => lib.fmt(p)).join(', '));

// Equip pickaxe
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Mine up to 32 netherrack
let mined = 0;
for (const p of safeDigSpots) {
  if (lib.count('netherrack') >= 32) break;
  try {
    console.log(`Mining netherrack at ${lib.fmt(p)}...`);
    await lib.dig(p.x, p.y, p.z);
    await sleep(50);
    await lib.pickup(4);
    mined++;
  } catch (e) {
    console.log(`Dig error at ${lib.fmt(p)}:`, e.message);
  }
}

console.log(`Mined ${mined} netherrack. Total in inv:`, lib.count('netherrack'));
console.log('Inventory now:', JSON.stringify(lib.inv()));
