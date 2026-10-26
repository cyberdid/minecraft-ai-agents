// programs/377-advance-east-fortress-scout.js
console.log('=== Program 377: Advance East Corridor & Fortress Scout ===');

console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Move towards East scout waypoint (63, 60, -3)
console.log('Advancing along East scout trail towards (63, 60, -3)...');
try {
  await lib.goTo(63, 60, -3, 3, { timeoutMs: 30000 });
  console.log('Reached East outpost at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Advance note:', e.message);
  try {
    await lib.goToXZ(63, -3, { timeoutMs: 25000 });
  } catch (e2) {}
}

console.log('Current position:', lib.fmt(bot.entity.position));

// 2. Scan for Nether Fortress blocks (nether_brick, nether_brick_fence)
const fortressBlocks = bot.findBlocks({
  matching: (b) => b && (b.name.includes('nether_brick') || b.name.includes('spawner')),
  maxDistance: 64,
  count: 20
});

if (fortressBlocks.length > 0) {
  console.log(`*** NETHER FORTRESS BLOCKS DETECTED: ${fortressBlocks.length} ***`);
  for (const fb of fortressBlocks.slice(0, 5)) {
    console.log(`  ${bot.blockAt(fb)?.name} at ${lib.fmt(fb)}`);
  }
  bot.chat(`team: NETHER FORTRESS DETECTED near ${lib.fmt(fortressBlocks[0])}!`);
} else {
  console.log('No nether_brick blocks within 64m. Continuing scout scan.');
}

// 3. Scan for Piglins (bartering with gold_ingot)
const piglins = Object.values(bot.entities).filter(e => 
  e && e.name === 'piglin' && e.position && bot.entity.position.distanceTo(e.position) < 24
);
console.log(`Piglins nearby: ${piglins.length}`);

// If Piglins nearby and we have gold_ingot, we can barter
if (piglins.length > 0 && lib.count('gold_ingot') > 0) {
  const piglin = piglins[0];
  console.log(`Piglin found at ${lib.fmt(piglin.position)}! Tossing 1 gold_ingot to barter...`);
  try {
    await lib.goTo(piglin.position.x, piglin.position.y, piglin.position.z, 3, { timeoutMs: 10000 });
    const goldId = mcData.itemsByName.gold_ingot.id;
    await bot.toss(goldId, null, 1);
    console.log('Tossed gold_ingot to piglin!');
    await sleep(7000); // bartering takes ~6-8s
    await lib.pickup(6);
    console.log('Barter pickup complete. Inventory:', JSON.stringify(lib.inv()));
  } catch (err) {
    console.log('Barter note:', err.message);
  }
}

// 4. Scan for Blazes or Endermen
const targets = Object.values(bot.entities).filter(e => 
  e && (e.name === 'blaze' || e.name === 'enderman' || e.name === 'wither_skeleton') &&
  e.position && bot.entity.position.distanceTo(e.position) < 32
);
console.log(`Key mobs found nearby: ${targets.length}`);
for (const m of targets) {
  console.log(`  ${m.name} at ${lib.fmt(m.position)}, dist=${bot.entity.position.distanceTo(m.position).toFixed(1)}m`);
}

// 5. Check teammates
for (const name of ['beta', 'delta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

bot.chat(`team: Alpha scouted to ${lib.fmt(bot.entity.position)}. Fortress blocks: ${fortressBlocks.length}, Key mobs: ${targets.length}. Cobblestone: ${lib.count('cobblestone')}.`);

console.log('Alpha status:', JSON.stringify(lib.status()));
