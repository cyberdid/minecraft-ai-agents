// programs/882-barter-in-covered-tunnel.js
console.log('=== Program 882: Move to Covered Tunnel & Barter for Ender Pearls ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots on feet
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
console.log(`Golden boots: ${bot.inventory.slots[8]?.name}`);

// 1. Walk down to Fortress Workshop Bunker (44, 65, -132)
console.log('Walking to Fortress Workshop Bunker (44, 65, -132)...');
try {
  await lib.goTo(44, 65, -132, 1.2, { timeoutMs: 6000, dig: false });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(44, 65, -132, 1.2)); } catch (e2) {}
}

console.log(`At bunker: ${lib.fmt(bot.entity.position)}`);

// 2. Advance inside covered tunnel to (44, 65, -145)
console.log('Advancing along covered tunnel to (44, 65, -145)...');
try {
  await lib.goTo(44, 65, -145, 1.5, { timeoutMs: 8000, dig: false });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(44, 65, -145, 1.5)); } catch (e2) {}
}

console.log(`Inside covered tunnel: ${lib.fmt(bot.entity.position)}`);

// 3. Scan for Piglins within 24m
const piglins = Object.values(bot.entities).filter(e =>
  e.isValid &&
  e.name === 'piglin' &&
  bot.entity.position.distanceTo(e.position) <= 24
);

console.log(`Piglins found near covered tunnel: ${piglins.length}:`);
for (const pig of piglins) {
  console.log(`  Piglin at ${lib.fmt(pig.position)} (dist: ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m)`);
}

// 4. Scan for Endermen within 24m
const endermen = Object.values(bot.entities).filter(e =>
  e.isValid &&
  e.name === 'enderman' &&
  bot.entity.position.distanceTo(e.position) <= 24
);
console.log(`Endermen found: ${endermen.length}`);
for (const end of endermen) {
  console.log(`  Enderman at ${lib.fmt(end.position)} (dist: ${bot.entity.position.distanceTo(end.position).toFixed(1)}m)`);
}

// 5. If Piglin found and we have gold_ingot, BARTER!
const ingots = lib.count('gold_ingot');
if (ingots > 0 && piglins.length > 0) {
  piglins.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  const piglin = piglins[0];
  console.log(`Targeting Piglin at ${lib.fmt(piglin.position)} for bartering ${ingots} gold ingots...`);

  // Move within 3m
  try {
    await bot.pathfinder.goto(new goals.GoalNear(piglin.position.x, piglin.position.y, piglin.position.z, 2.5));
  } catch (e) {}

  for (let round = 0; round < ingots && !checkCancelled(); round++) {
    const gold = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (!gold) break;

    bot.chat(`Beta: Tossing gold ingot to neutral Piglin for barter #${round + 1}!`);
    await bot.lookAt(piglin.position.offset(0, 1.0, 0), true);
    await bot.toss(gold.type, null, 1);
    console.log('Tossed gold ingot! Waiting 7.5s for Piglin inspection and drop...');
    await sleep(7500);

    // Vacuum drops
    await lib.pickup(5.0);
    const pearls = lib.count('ender_pearl');
    console.log(`Current Ender Pearls in inventory: ${pearls}`);
    if (pearls > 0) {
      bot.chat(`Beta: HARVESTED ${pearls} ENDER PEARL(S)! Milestone 9 progressing!`);
    }
  }
} else if (piglins.length === 0) {
  console.log('No Piglins within 24m of (44, 65, -145). Checking further along tunnel to (44, 65, -160)...');
  try {
    await lib.goTo(44, 65, -160, 2.0, { timeoutMs: 8000, dig: false });
  } catch (e) {}
  
  // Re-scan
  const morePiglins = Object.values(bot.entities).filter(e =>
    e.isValid && e.name === 'piglin' && bot.entity.position.distanceTo(e.position) <= 24
  );
  console.log(`Piglins near (44, 65, -160): ${morePiglins.length}`);
}

// Check final inventory
console.log('Final inventory:', JSON.stringify(lib.inv()));
bot.chat(`Beta: Covered tunnel report — Pos: ${lib.fmt(bot.entity.position)}, Gold: ${lib.count('gold_ingot')}, Pearls: ${lib.count('ender_pearl')}`);

return {
  pos: bot.entity.position,
  ender_pearls: lib.count('ender_pearl'),
  gold_ingots: lib.count('gold_ingot'),
  piglins: piglins.length
};
