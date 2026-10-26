// programs/401-build-deck-staircase.js
console.log('=== Program 401: Build Fortress Deck Staircase & Scan Interior ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Announce descent construction
bot.chat('team: Alpha, Beta & Delta building protected staircase from (44, 65, -129) down to Fortress corridor deck at y=54!');

// 2. Scan fortress interior blocks below (y=50..56)
const deckBricks = bot.findBlocks({
  matching: mcData.blocksByName.nether_bricks?.id,
  maxDistance: 32,
  count: 64
}).filter(p => p.y <= 56);

console.log(`Fortress deck blocks found below (y<=56): ${deckBricks.length}`);
if (deckBricks.length > 0) {
  console.log(`Nearest deck block: ${lib.fmt(deckBricks[0])}`);
}

// 3. Scan for Blaze Spawners and Chests
const spawners = bot.findBlocks({
  matching: mcData.blocksByName.spawner?.id,
  maxDistance: 48,
  count: 5
});
console.log(`Spawners in range: ${spawners.length}`);
for (const sp of spawners) {
  console.log(`  >>> BLAZE SPAWNER AT: ${lib.fmt(sp)} <<<`);
  bot.chat(`team: BLAZE SPAWNER LOCATED AT ${lib.fmt(sp)}!`);
}

const chests = bot.findBlocks({
  matching: mcData.blocksByName.chest?.id,
  maxDistance: 48,
  count: 5
});
console.log(`Fortress chests in range: ${chests.length}`);
for (const cp of chests) {
  console.log(`  >>> FORTRESS CHEST AT: ${lib.fmt(cp)} <<<`);
  bot.chat(`team: FORTRESS CHEST FOUND AT ${lib.fmt(cp)}!`);
}

// 4. Check teammates in bunker
for (const name of ['delta', 'beta', 'gamma']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

// 5. Build descent steps if cobblestone available
if (lib.count('cobblestone') >= 2) {
  console.log('Placing descent support block at (44, 64, -130)...');
  try {
    await lib.place('cobblestone', 44, 64, -130);
  } catch (e) {
    console.log('Place step note:', e.message);
  }
}

bot.chat(`team: Fortress deck reconnaissance complete! Deck bricks: ${deckBricks.length}, Spawners: ${spawners.length}, Chests: ${chests.length}.`);

console.log('Alpha status:', JSON.stringify(lib.status()));
