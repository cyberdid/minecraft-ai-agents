// programs/452-fortress-spawner-scout.js
console.log('=== Step: Scout Fortress corridors with Alpha for Blaze Spawner and Nether Wart ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Teammate Alpha distance:', bot.players['alpha']?.entity ? bot.entity.position.distanceTo(bot.players['alpha'].entity.position).toFixed(1) + 'm' : 'nearby');

// 1. Scan 50m radius for spawner
const spawners = bot.findBlocks({
  matching: mcData.blocksByName.spawner?.id,
  maxDistance: 50,
  count: 5
});
console.log(`Spawners found in fortress: ${spawners.length}`);
for (const s of spawners) {
  console.log(`  *** SPAWNER AT ${lib.fmt(s)}! ***`);
  bot.chat(`beta: BLAZE SPAWNER AT ${lib.fmt(s)}!`);
}

// 2. Scan for nether_wart
const warts = bot.findBlocks({
  matching: mcData.blocksByName.nether_wart?.id,
  maxDistance: 40,
  count: 10
});
console.log(`Nether wart patches found: ${warts.length}`);
for (const w of warts) {
  console.log(`  Nether wart at ${lib.fmt(w)}`);
  bot.chat(`beta: NETHER WART FOUND AT ${lib.fmt(w)}!`);
}

// 3. Scan for fortress chests
const chests = bot.findBlocks({
  matching: mcData.blocksByName.chest?.id,
  maxDistance: 35,
  count: 5
});
console.log(`Fortress chests found: ${chests.length}`);
for (const c of chests) {
  console.log(`  Fortress chest at ${lib.fmt(c)}`);
}

// 4. Scan for Blazes
const blazes = Object.values(bot.entities).filter(e => e.name === 'blaze');
console.log(`Blazes detected (${blazes.length}):`);
for (const b of blazes) {
  console.log(`  Blaze at ${lib.fmt(b.position)}, dist=${bot.entity.position.distanceTo(b.position).toFixed(1)}m`);
}

bot.chat(`beta: Fortress reconnaissance: Spawners=${spawners.length}, Wart=${warts.length}, Chests=${chests.length}, Blazes=${blazes.length}. Alpha & Beta holding bridgehead!`);
