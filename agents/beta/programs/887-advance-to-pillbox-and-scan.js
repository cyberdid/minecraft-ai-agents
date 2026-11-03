// programs/887-advance-to-pillbox-and-scan.js
console.log('=== Program 887: Advance to Spawner Pillbox (36.5, 66, -187) ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}

console.log('Beta start pos:', lib.fmt(bot.entity.position));

// Advance to Pillbox (36.5, 66, -187)
const pillboxPos = new Vec3(36.5, 66.0, -187.0);
console.log(`Advancing to Pillbox at ${lib.fmt(pillboxPos)}...`);

try {
  await lib.goTo(38, 65, -176, 1.2, { timeoutMs: 5000, dig: false });
} catch (e) {}

try {
  await lib.goTo(pillboxPos.x, pillboxPos.y, pillboxPos.z, 0.8, { timeoutMs: 8000, dig: false });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(pillboxPos.x, pillboxPos.y, pillboxPos.z, 0.8)); } catch (e2) {}
}

console.log(`At Pillbox! Pos: ${lib.fmt(bot.entity.position)}`);

// Scan for all mobs within 32m
const allMobs = Object.values(bot.entities).filter(e =>
  e.isValid &&
  bot.entity.position.distanceTo(e.position) <= 32 &&
  ['piglin', 'enderman', 'blaze', 'wither_skeleton', 'zombified_piglin'].includes(e.name)
);

console.log(`Nether mobs detected within 32m: ${allMobs.length}:`);
for (const m of allMobs) {
  console.log(`  ${m.name} at ${lib.fmt(m.position)} (dist: ${bot.entity.position.distanceTo(m.position).toFixed(1)}m)`);
}

// Check for Piglins to barter
const piglins = allMobs.filter(m => m.name === 'piglin');
const ingots = lib.count('gold_ingot');
if (ingots > 0 && piglins.length > 0) {
  piglins.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  const piglin = piglins[0];
  console.log(`Bartering with Piglin at ${lib.fmt(piglin.position)}...`);
  bot.chat(`Beta: Bartering gold ingot with Piglin near Pillbox!`);

  for (let r = 0; r < ingots && !checkCancelled(); r++) {
    const gold = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (!gold) break;

    await bot.lookAt(piglin.position.offset(0, 1.0, 0), true);
    await bot.toss(gold.type, null, 1);
    console.log('Tossed gold ingot! Waiting 7.5s...');
    await sleep(7500);

    await lib.pickup(5.0);
    const pearls = lib.count('ender_pearl');
    console.log(`Pearls: ${pearls}`);
    if (pearls > 0) {
      bot.chat(`Beta: HARVESTED ${pearls} ENDER PEARL(S)!`);
    }
  }
}

// Check for Blaze Rods or any other items
console.log('Inventory summary:', JSON.stringify(lib.inv()));
bot.chat(`Beta: Pillbox report — Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Piglins: ${piglins.length}, Blazes: ${allMobs.filter(m => m.name === 'blaze').length}`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  mobs: allMobs.map(m => m.name),
  ender_pearls: lib.count('ender_pearl')
};
