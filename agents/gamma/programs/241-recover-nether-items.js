// programs/241-recover-nether-items.js
console.log('=== TRANSIT TO NETHER & RECOVER DROPPED GEAR ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);

// 1. Step into Overworld Nether portal
console.log('Stepping into portal block at (299, 73, -54)...');
try {
  await lib.walkTo(299.5, -53.5, 3000);
} catch (e) {
  try {
    bot.setControlState('jump', true);
    await lib.walkTo(299.5, -53.5, 2000);
    bot.clearControlStates();
  } catch (e2) {}
}

bot.clearControlStates();

// Wait for transit to the_nether (up to 15s)
console.log('Waiting for Nether transit...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  console.log('Still in overworld! Stepping back and into portal...');
  await lib.walkTo(299.5, -52.0, 1500);
  await sleep(500);
  bot.setControlState('jump', true);
  await lib.walkTo(299.5, -53.5, 1500);
  bot.clearControlStates();
  const t1 = Date.now();
  while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t1 < 10000)) {
    await sleep(500);
  }
}

console.log('Dimension now:', bot.game.dimension);
console.log('Nether arrival pos:', lib.fmt(bot.entity.position));

if (String(bot.game.dimension).includes('nether')) {
  // Step out of portal hitbox to bunker floor
  await sleep(400);
  await lib.walkTo(40.5, -5.0, 2000);
  bot.clearControlStates();
  console.log('In Nether bunker at (40.5, 65, -5)!');

  // 2. Scan for dropped items within 32m
  const dropped = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 32);
  console.log(`Found ${dropped.length} dropped items nearby:`);
  for (const it of dropped) {
    console.log(` - Item entity ${it.id} at ${lib.fmt(it.position)} (dist: ${bot.entity.position.distanceTo(it.position).toFixed(1)}m)`);
  }

  // Check for nearby fire blocks to extinguish or avoid
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 24,
    count: 20
  });
  console.log(`Fires found nearby (${fires.length}):`, fires.map(p => lib.fmt(p)));

  // If items dropped at (54, 67, -0), approach cautiously
  for (const it of dropped) {
    if (it.isValid) {
      console.log(`Approaching item at ${lib.fmt(it.position)}...`);
      try {
        await lib.goTo(it.position.x, it.position.y, it.position.z, 1, { timeoutMs: 15000 });
        await lib.pickup(6);
      } catch (e) {
        console.log(`Pickup error for item ${it.id}:`, e.message);
      }
    }
  }

  console.log('Inv after recovery:', JSON.stringify(lib.inv()));
  console.log('HP:', bot.health, 'Food:', bot.food);

  // Check teammates
  for (const p of Object.values(bot.players)) {
    if (p.username !== bot.username && p.entity) {
      console.log(`Teammate ${p.username} at ${lib.fmt(p.entity.position)} dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m held=${p.entity.heldItem?.name || 'none'}`);
    }
  }

  bot.chat(`gamma in Nether! HP: ${bot.health}, Food: ${bot.food}, cobble: x${lib.count('cobblestone')}, wood: x${lib.count('*_planks')}`);
}
