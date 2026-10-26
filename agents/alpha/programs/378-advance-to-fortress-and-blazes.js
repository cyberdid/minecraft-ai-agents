// programs/378-advance-to-fortress-and-blazes.js
console.log('=== Program 378: Advance to Nether Fortress & Farm Blazes ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Stage 1: Move North along ridge to (61, 67, -59)
console.log('Moving towards Stage 1 waypoint (61, 67, -59)...');
try {
  await lib.goTo(61, 67, -59, 3, { timeoutMs: 30000 });
  console.log('Reached Stage 1 waypoint:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 1 travel note:', e.message);
  try {
    await lib.goToXZ(61, -59, { timeoutMs: 25000 });
  } catch (e2) {}
}

console.log('Alpha at:', lib.fmt(bot.entity.position));

// 2. Stage 2: Advance to Nether Fortress at (45, 53, -116)
console.log('Advancing towards Nether Fortress at (45, 53, -116)...');
try {
  await lib.goTo(45, 53, -116, 4, { timeoutMs: 35000 });
  console.log('Arrived at Nether Fortress entrance:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Fortress approach note:', e.message);
  try {
    await lib.goToXZ(45, -116, { timeoutMs: 30000 });
  } catch (e2) {}
}

console.log('Current position at fortress:', lib.fmt(bot.entity.position));

// 3. Scan for Fortress blocks & Spawners
const fortressBlocks = bot.findBlocks({
  matching: (b) => b && (b.name.includes('nether_brick') || b.name.includes('spawner')),
  maxDistance: 32,
  count: 20
});
console.log(`Fortress blocks in view: ${fortressBlocks.length}`);

const spawners = bot.findBlocks({
  matching: (b) => b && b.name.includes('spawner'),
  maxDistance: 32,
  count: 5
});
console.log(`Spawners found: ${spawners.length}`);
for (const sp of spawners) {
  console.log(`  Spawner at: ${lib.fmt(sp)}`);
}

// 4. Scan for Blazes and combat
const blazes = Object.values(bot.entities).filter(e => 
  e && e.name === 'blaze' && e.position && bot.entity.position.distanceTo(e.position) < 24
);
console.log(`Blazes nearby: ${blazes.length}`);

for (const blaze of blazes) {
  if (isCancelled()) break;
  if (bot.health <= 8) {
    console.log('Health low, retreating behind cobblestone cover!');
    break;
  }
  console.log(`Engaging blaze at ${lib.fmt(blaze.position)}...`);
  try {
    // Equip iron sword in main hand, shield in offhand
    const sword = bot.inventory.items().find(i => i.name === 'iron_sword');
    if (sword) await bot.equip(sword, 'hand');
    await lib.equipArmor();

    await lib.goTo(blaze.position.x, blaze.position.y, blaze.position.z, 2, { timeoutMs: 10000 });
    for (let hit = 0; hit < 4; hit++) {
      if (!bot.entities[blaze.id]) break;
      await bot.lookAt(blaze.position.offset(0, 0.9, 0), true);
      await bot.attack(blaze);
      await sleep(650);
    }
    await lib.pickup(6);
    console.log(`Blaze defeated! Blaze rods in inv: ${lib.count('blaze_rod')}`);
  } catch (err) {
    console.log('Blaze fight note:', err.message);
  }
}

// 5. Check Blaze Rods
console.log('Blaze rods collected:', lib.count('blaze_rod'));
bot.chat(`team: Alpha at Nether Fortress (${lib.fmt(bot.entity.position)}). Fortress blocks: ${fortressBlocks.length}, Blaze rods: ${lib.count('blaze_rod')}. HP: ${bot.health}/20.`);

console.log('Alpha status:', JSON.stringify(lib.status()));
