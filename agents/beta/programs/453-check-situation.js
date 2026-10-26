// programs/453-check-situation.js
console.log('=== Step: Check Situation at Fortress ===');
console.log('Beta Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));

// 1. Players nearby
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Player ${name}: pos=${lib.fmt(p.entity.position)} dist=${d.toFixed(1)}m`);
  } else {
    console.log(`Player ${name}: entity not loaded or offline`);
  }
}

// 2. Hostiles / mobs within 25m
const mobs = Object.values(bot.entities).filter(e => 
  e.type === 'mob' && bot.entity.position.distanceTo(e.position) < 30
);
console.log(`Mobs within 30m (${mobs.length}):`);
for (const m of mobs) {
  const d = bot.entity.position.distanceTo(m.position);
  console.log(`  ${m.name} at ${lib.fmt(m.position)} (dist ${d.toFixed(1)}m)`);
}

// 3. Dropped items within 15m
const items = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 15
);
console.log(`Dropped items within 15m (${items.length}):`);
for (const it of items) {
  const d = bot.entity.position.distanceTo(it.position);
  console.log(`  Item at ${lib.fmt(it.position)} (dist ${d.toFixed(1)}m)`);
}

// 4. Inspect bunker blocks around (44, 65, -128)
console.log('Blocks around beta:');
for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    for (let dy = 0; dy <= 2; dy++) {
      const p = bot.entity.position.floored().offset(dx, dy, dz);
      const b = bot.blockAt(p);
      if (b && b.name !== 'air') {
        console.log(`  Block at ${p.x},${p.y},${p.z}: ${b.name}`);
      }
    }
  }
}

// 5. Scan for spawner, chests, nether_wart
const spawners = bot.findBlocks({ matching: mcData.blocksByName.spawner?.id, maxDistance: 64, count: 5 });
console.log(`Spawners within 64m: ${spawners.length}`);
for (const s of spawners) console.log(`  Spawner at ${lib.fmt(s)}`);

const chests = bot.findBlocks({ matching: mcData.blocksByName.chest?.id, maxDistance: 64, count: 5 });
console.log(`Chests within 64m: ${chests.length}`);
for (const c of chests) console.log(`  Chest at ${lib.fmt(c)}`);

const warts = bot.findBlocks({ matching: mcData.blocksByName.nether_wart?.id, maxDistance: 64, count: 5 });
console.log(`Nether wart within 64m: ${warts.length}`);
for (const w of warts) console.log(`  Wart at ${lib.fmt(w)}`);
