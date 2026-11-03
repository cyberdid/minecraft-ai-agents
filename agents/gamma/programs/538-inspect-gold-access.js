// programs/538-inspect-gold-access.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 538: INSPECT GOLD ACCESS ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Walk back to Bunker at (44, 65, -127)
try {
  await lib.goTo(44, 65, -128, 1.2, { timeoutMs: 6000 });
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(44, 65, -128, 1.0));
  } catch (e2) {}
}

console.log('Position inside Bunker:', lib.fmt(bot.entity.position));

// 1. Locate all nether_gold_ore blocks within 24m
const ores = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gold_block'),
  maxDistance: 24,
  count: 25
});

console.log(`Found ${ores.length} gold ores within 24m:`);
for (const op of ores) {
  const d = bot.entity.position.distanceTo(op).toFixed(1);
  console.log(`  Ore at ${lib.fmt(op)} (dist: ${d}m)`);
}

// 2. Check blocks above head at (44, 65..72, -128)
console.log('Vertical column above bunker at (44, y, -128):');
for (let y = 65; y <= 75; y++) {
  const b = bot.blockAt(new Vec3(44, y, -128));
  console.log(`  y=${y}: ${b?.name}`);
}

// 3. Check Crafting Table in bunker
const tables = bot.findBlocks({
  matching: b => b && b.name === 'crafting_table',
  maxDistance: 16,
  count: 5
});
console.log(`Crafting tables nearby: ${tables.length}`);
for (const tp of tables) {
  console.log(`  Table at ${lib.fmt(tp)}`);
}

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  oresCount: ores.length,
  tablesCount: tables.length,
  ores: ores.map(p => ({ x: p.x, y: p.y, z: p.z }))
};
