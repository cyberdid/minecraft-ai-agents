// programs/702-walk-to-bunker-and-inspect.js
console.log('=== Walk to Bunker and Inspect ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// Raise shield
bot.activateItem(true);
globalThis.configureFireAvoidance();

// Walk to bunker at (41, 65, -6)
const bunkerTarget = new Vec3(41.0, 65.0, -6.0);
console.log(`Walking to bunker ${lib.fmt(bunkerTarget)}...`);
try {
  await bot.pathfinder.goto(new goals.GoalNear(41.0, 65.0, -6.0, 1.2));
} catch (e) {
  try {
    await lib.goTo(41, 65, -6, 1.5, { timeoutMs: 6000 });
  } catch (e2) {
    console.log('Path error:', e2.message);
  }
}

console.log('Alpha now at:', lib.fmt(bot.entity.position));

// Check players at bunker
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && bot.entity.position.distanceTo(p.entity.position) < 15) {
    console.log(`Player ${name} nearby: pos=${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name}`);
  }
}

// Check crafting table at bunker
const craftTable = bot.findBlock({
  matching: b => b && b.name.includes('crafting_table'),
  maxDistance: 8
});
console.log('Crafting table found:', craftTable ? lib.fmt(craftTable.position) : 'none');

// Scan for safe nether_gold_ore from bunker
const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
if (goldOreId) {
  const ores = bot.findBlocks({ matching: goldOreId, maxDistance: 32, count: 20 })
    .map(p => bot.blockAt(p))
    .filter(Boolean);
  console.log(`Found ${ores.length} gold ores within 32m of bunker:`);
  for (const ore of ores) {
    const dist = bot.entity.position.distanceTo(ore.position).toFixed(1);
    console.log(` - ${lib.fmt(ore.position)} dist=${dist}m`);
  }
}

// Check dropped items at bunker
const drops = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 10);
console.log(`Found ${drops.length} dropped items nearby:`);
for (const d of drops) {
  console.log(` - item at ${lib.fmt(d.position)}`);
}

// Pickup any drops
await lib.pickup(6);
console.log('Alpha inv:', lib.inv());
