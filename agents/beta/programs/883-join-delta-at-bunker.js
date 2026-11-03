// programs/883-join-delta-at-bunker.js
console.log('=== Program 883: Join Delta at Bunker (44, 65, -132) ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

console.log('Starting pos:', lib.fmt(bot.entity.position));

// 1. Step to base of stairs (46, 65, -114)
console.log('Stepping to (46, 65, -114)...');
try {
  await lib.goTo(46, 65, -114, 1.2, { timeoutMs: 5000, dig: true });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(46, 65, -114, 1.5)); } catch (e2) {}
}

console.log('Pos at walkway:', lib.fmt(bot.entity.position));

// 2. Walk along walkway to bunker entrance (44, 65, -127)
console.log('Walking to bunker entrance (44, 65, -127)...');
try {
  await lib.goTo(44, 65, -127, 1.2, { timeoutMs: 6000, dig: false });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(44, 65, -127, 1.5)); } catch (e2) {}
}

// 3. Enter bunker to (44, 65, -132)
console.log('Entering bunker to (44, 65, -132)...');
try {
  await lib.goTo(44, 65, -132, 1.0, { timeoutMs: 6000, dig: false });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(44, 65, -132, 1.0)); } catch (e2) {}
}

console.log('At bunker pos:', lib.fmt(bot.entity.position));

// Scan for teammates
for (const [name, pl] of Object.entries(bot.players)) {
  if (name === bot.username) continue;
  if (pl && pl.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(pl.entity.position)}, held: ${pl.entity.heldItem ? pl.entity.heldItem.name : 'empty'}`);
  }
}

// Scan for Piglins and Endermen within 32m
const mobs = Object.values(bot.entities).filter(e =>
  e.isValid &&
  bot.entity.position.distanceTo(e.position) <= 32 &&
  ['piglin', 'enderman', 'zombified_piglin'].includes(e.name)
);

console.log(`Nearby Nether entities (${mobs.length}):`);
for (const m of mobs) {
  console.log(`  ${m.name} at ${lib.fmt(m.position)} (dist: ${bot.entity.position.distanceTo(m.position).toFixed(1)}m)`);
}

bot.chat(`Beta: United with team in Fortress Bunker at ${lib.fmt(bot.entity.position)}! Gold ingots: ${lib.count('gold_ingot')}, Pearls: ${lib.count('ender_pearl')}`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  gold_ingots: lib.count('gold_ingot'),
  mobs: mobs.map(m => m.name)
};
