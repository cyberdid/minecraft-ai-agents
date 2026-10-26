// programs/220-inspect-fortress-deck.js
console.log('=== INSPECT FORTRESS DECK AT Y=53 ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Blocks under feet and 3x3 around feet at y=52, 53, 54
console.log('\n--- BLOCKS AROUND FEET ---');
for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    const floor = bot.blockAt(bot.entity.position.offset(dx, -1, dz));
    const feet = bot.blockAt(bot.entity.position.offset(dx, 0, dz));
    const head = bot.blockAt(bot.entity.position.offset(dx, 1, dz));
    console.log(`offset (${dx}, ${dz}): floor=${floor?.name} feet=${feet?.name} head=${head?.name}`);
  }
}

// 2. Check dropped items details
console.log('\n--- DETAILED DROPPED ITEMS ---');
const dropped = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 30);
for (const it of dropped) {
  // Try to inspect metadata if available
  console.log(`Item entity id=${it.id} pos=${lib.fmt(it.position)} dist=${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

// 3. Inspect corridor towards z=-160 (where delta died)
console.log('\n--- CORRIDOR SCAN from z=-178 to z=-160 at x=43..44, y=52..53 ---');
for (let z = -178; z <= -160; z += 2) {
  const floor43 = bot.blockAt(new Vec3(43, 52, z));
  const floor44 = bot.blockAt(new Vec3(44, 52, z));
  console.log(`z=${z}: floor(43)=${floor43?.name} floor(44)=${floor44?.name}`);
}

// 4. Hostiles status
const hostiles = lib.hostiles(32);
console.log('\nHostiles within 32m:', JSON.stringify(hostiles));

bot.chat(`gamma at ${lib.fmt(bot.entity.position)} with 0.2 HP! Fortress deck reached!`);
