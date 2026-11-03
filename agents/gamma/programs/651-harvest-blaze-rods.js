// programs/651-harvest-blaze-rods.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 651: FAST NETHER TRANSIT & BLAZE ROD FARMING ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.chat('gamma: Gearing up and marching to Blaze Spawner Pillbox for Milestone 8!');

// 1. Quick regear (weapons, armor, shield)
try {
  await quickRegear({ cobble: 16 });
} catch (e) {
  console.log('quickRegear notice:', e.message);
}

// Ensure golden_boots on feet for 100% Piglin neutrality
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); } catch (e) {}
  }
}

// Ensure shield in offhand
if (bot.inventory.slots[45]?.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) {
    try { await bot.equip(sh, 'off-hand'); } catch (e) {}
  }
}

// Ensure weapon in hand
try { await lib.equipWeapon(); } catch (e) {}

// 2. Enter Nether Portal
if (bot.game.dimension === 'overworld') {
  console.log('Entering Nether Portal at (299.5, 73.0, -54.0)...');
  await enterNetherPortal();
  console.log('Portal warp complete! Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
}

// 3. March safe waypoints directly to Spawner Pillbox (36.5, 66, -187)
if (bot.game.dimension === 'the_nether') {
  console.log('Marching along safe waypoints to Spawner Pillbox...');
  await marchToSpawnerPillbox();
  console.log('Pillbox approach complete. Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

  // 4. Farm Blaze Rods safely from Pillbox (target 8 rods, duration 90s)
  if (bot.entity.position.distanceTo(new Vec3(36.5, 66.0, -187.0)) <= 8.0) {
    console.log('Stationed at Spawner Pillbox! Fighting Blazes behind protective firing slit...');
    const farmResult = await farmBlazeRodsAtPillbox(8, 90000);
    console.log('Pillbox farming result:', farmResult);
  } else {
    console.log('Not yet at pillbox (dist > 8m), pos:', lib.fmt(bot.entity.position));
  }

  // 5. If target reached, retreat to Overworld base
  const rods = lib.count('blaze_rod');
  console.log(`Current Blaze Rods held: ${rods}/8`);
  if (rods >= 8) {
    bot.chat(`gamma: MILESTONE 8 COMPLETE! Harvested ${rods} Blaze Rods! Retreating to Overworld Base!`);
    await retreatToOverworldBase();
    console.log('Retreat complete. Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  blaze_rods: lib.count('blaze_rod'),
  inv: lib.inv()
};
