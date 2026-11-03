// programs/472-march-and-farm-blazes.js
console.log('=== GAMMA: MARCH TO PILLBOX & FARM BLAZES ===');
console.log('Initial pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// 1. Ensure weapon equipped and shield in offhand
try { await lib.equipWeapon(); } catch (e) {}
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(shield, 'off-hand'); } catch (e) {}
}

// 2. If inside base house, exit through south door (294, 72, -54)
if (bot.game.dimension === 'overworld' && bot.entity.position.z < -53.2) {
  console.log('Exiting base door...');
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -52.5, 0.5));
    await lib.door(294, 72, -54, false);
  } catch (e) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
  }
}

// 3. March directly to Blaze Spawner Pillbox using fast preloaded autoload helper
console.log('Calling globalThis.marchToSpawnerPillbox()...');
const marchRes = await globalThis.marchToSpawnerPillbox();
console.log('March complete:', JSON.stringify(marchRes));

// 4. Farm Blazes at Pillbox
if (bot.game.dimension === 'the_nether') {
  console.log('Stationed at Pillbox. Beginning Blaze combat...');
  bot.chat('gamma: Joined Alpha, Beta & Delta at Pillbox! Farming Blazes with active shield!');
  const farmRes = await globalThis.farmBlazeRodsAtPillbox(8, 100000);
  console.log('Farm complete:', JSON.stringify(farmRes));
}

const totalRods = lib.count('blaze_rod');
bot.chat(`gamma: Round complete. Blaze Rods held: ${totalRods}/8, HP: ${bot.health.toFixed(1)}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  rods: totalRods,
  inv: lib.inv()
};
