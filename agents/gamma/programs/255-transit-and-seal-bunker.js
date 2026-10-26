// programs/255-transit-and-seal-bunker.js
console.log('=== TRANSIT TO NETHER & SECURE BUNKER ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// Gamma is already inside the portal block (299.6, 73.0, -54.5)
bot.clearControlStates();

console.log('Standing still inside portal for Nether transit...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 20000)) {
  await sleep(500);
  console.log(`[${Math.round((Date.now() - t0)/1000)}s] dim=${bot.game.dimension} pos=${lib.fmt(bot.entity.position)}`);
}

console.log('Dimension now:', bot.game.dimension);
console.log('Pos now:', lib.fmt(bot.entity.position));

if (String(bot.game.dimension).includes('nether')) {
  console.log('=== ARRIVED IN THE NETHER BUNKER ===');
  await sleep(400);

  // Stand safely behind portal frame at (40.5, 65.0, -7.0)
  await lib.walkTo(40.5, -7.0, 2000);
  bot.clearControlStates();

  console.log('Inside bunker at:', lib.fmt(bot.entity.position));
  console.log('HP:', bot.health, 'Food:', bot.food);
  console.log('Cobblestone:', lib.count('cobblestone'));

  // Seal south gap at (40, 65, -5) and (41, 65, -5) if open to block Ghast fireballs
  for (const p of [new Vec3(40, 65, -5), new Vec3(41, 65, -5)]) {
    const b = bot.blockAt(p);
    if (b && b.name === 'air' && lib.count('cobblestone') > 2) {
      console.log(`Placing protective cobblestone seal at ${lib.fmt(p)}...`);
      try {
        await lib.place('cobblestone', p.x, p.y, p.z);
      } catch (e) {
        console.log(`Seal error at ${lib.fmt(p)}:`, e.message);
      }
    }
  }

  // Check hostiles nearby
  const hostiles = lib.hostiles(24);
  console.log(`Hostiles near bunker (${hostiles.length}):`, hostiles.map(h => `${h.name} at ${h.pos} dist=${h.dist.toFixed(1)}m`));

  // Check teammates
  for (const p of Object.values(bot.players)) {
    if (p.username !== bot.username && p.entity) {
      console.log(`Teammate ${p.username}: ${lib.fmt(p.entity.position)} held=${p.entity.heldItem?.name || 'none'}`);
    }
  }

  bot.chat(`gamma secured inside Nether bunker at (40, 65, -7)! HP ${bot.health}/20, cobble x${lib.count('cobblestone')}. Ready to march to fortress!`);
} else {
  console.log('Did not transit. Pos:', lib.fmt(bot.entity.position));
}
