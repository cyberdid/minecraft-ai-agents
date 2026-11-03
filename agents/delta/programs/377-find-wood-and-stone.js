// programs/377-find-wood-and-stone.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Search for logs in expanding radius up to 128 blocks
const logNames = ['oak_log', 'birch_log', 'spruce_log', 'dark_oak_log', 'acacia_log', 'jungle_log', 'mangrove_log', 'cherry_log'];
const logIds = logNames.map(name => mcData.blocksByName[name]?.id).filter(Boolean);

const foundLogs = bot.findBlocks({
  matching: logIds,
  maxDistance: 96,
  count: 10
});

console.log(`Found ${foundLogs.length} logs within 96m:`);
for (const p of foundLogs) {
  const b = bot.blockAt(p);
  console.log(`  ${b.name} at ${lib.fmt(p)} dist: ${bot.entity.position.distanceTo(p).toFixed(1)}m`);
}

// 2. Search for ground items within 40m
const groundItems = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 40);
console.log(`Found ${groundItems.length} ground items within 40m:`);
for (const e of groundItems) {
  console.log(`  Item at ${lib.fmt(e.position)} dist: ${bot.entity.position.distanceTo(e.position).toFixed(1)}m`);
}

// 3. Search for teammates
for (const name of ['alpha', 'beta', 'gamma']) {
  const p = bot.players[name]?.entity;
  if (p) {
    console.log(`Teammate ${name} at ${lib.fmt(p.position)}`);
  } else {
    console.log(`Teammate ${name} not visible`);
  }
}
