// programs/381-scan-fortress-deck-and-spawners.js
console.log('=== Program 381: Scan Fortress Deck & Spawners with Team ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Scan for spawners within 64 blocks
const spawnerId = mcData.blocksByName.spawner?.id;
let spawners = [];
if (spawnerId) {
  spawners = bot.findBlocks({ matching: spawnerId, maxDistance: 64, count: 5 });
}
console.log(`Blaze spawners detected: ${spawners.length}`);
for (const sp of spawners) {
  console.log(`  >>> BLAZE SPAWNER AT: ${lib.fmt(sp)} <<<`);
  bot.chat(`team: BLAZE SPAWNER LOCATED AT ${lib.fmt(sp)}!`);
}

// 2. Scan nether_bricks and find walkable floor
const nbId = mcData.blocksByName.nether_bricks.id;
const brickPositions = bot.findBlocks({ matching: nbId, maxDistance: 48, count: 64 });
console.log(`Found ${brickPositions.length} nether_brick blocks within 48m.`);

// Group brick y-levels
const yCounts = {};
for (const bp of brickPositions) {
  yCounts[bp.y] = (yCounts[bp.y] || 0) + 1;
}
console.log('Fortress deck y-levels distribution:', JSON.stringify(yCounts));

// 3. Meet with Gamma at (51, 65, -116)
const gamma = bot.players['gamma'];
if (gamma && gamma.entity) {
  console.log(`Gamma located at ${lib.fmt(gamma.entity.position)} (dist: ${bot.entity.position.distanceTo(gamma.entity.position).toFixed(1)}m)`);
  // If Gamma is close and low on health, share cooked_beef
  if (lib.count('cooked_beef') > 0 && bot.entity.position.distanceTo(gamma.entity.position) < 8) {
    try {
      console.log('Tossing 1 cooked_beef to Gamma...');
      await bot.toss(mcData.itemsByName.cooked_beef.id, null, 1);
      bot.chat('team: Alpha tossed cooked beef for Gamma!');
    } catch (e) {}
  }
}

// 4. Safe descent to main fortress deck (y=54)
// Find if there is an existing ramp or build a safe staircase down against column (45, y, -116)
if (spawners.length > 0) {
  const target = spawners[0];
  console.log(`Navigating towards Blaze Spawner at ${lib.fmt(target)}...`);
  try {
    await lib.goTo(target.x, target.y, target.z, 4, { timeoutMs: 30000 });
  } catch (e) {
    console.log('Spawner path note:', e.message);
  }
} else {
  // Navigate along nether brick walkway towards y=54
  const deckTarget = brickPositions.find(p => p.y <= 55);
  if (deckTarget) {
    console.log(`Navigating to fortress deck level at ${lib.fmt(deckTarget)}...`);
    try {
      await lib.goTo(deckTarget.x, deckTarget.y + 1, deckTarget.z, 2, { timeoutMs: 25000 });
      console.log('Arrived on fortress deck! Current pos:', lib.fmt(bot.entity.position));
    } catch (e) {
      console.log('Deck path note:', e.message);
    }
  }
}

// 5. Scan for Blazes and Wither Skeletons on deck
const blazes = Object.values(bot.entities).filter(e => 
  e && e.name === 'blaze' && e.position && bot.entity.position.distanceTo(e.position) < 32
);
console.log(`Blazes visible: ${blazes.length}`);
for (const bz of blazes) {
  console.log(`  Blaze at ${lib.fmt(bz.position)}, dist=${bot.entity.position.distanceTo(bz.position).toFixed(1)}m`);
}

bot.chat(`team: Alpha at Fortress ${lib.fmt(bot.entity.position)}. Spawners: ${spawners.length}, Blazes: ${blazes.length}. Cobalt/Iron ready!`);

console.log('Alpha status:', JSON.stringify(lib.status()));
