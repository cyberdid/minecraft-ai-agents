// programs/886-cross-bridge-piglin-barter.js
console.log('=== Program 886: Cross-Bridge Piglin Barter (z=-164 to -176) ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

// Verify golden boots on feet
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
console.log(`Feet armor: ${bot.inventory.slots[8]?.name}`);

// Step to blast wall (44, 65, -169)
console.log('Stepping to blast wall (44, 65, -169)...');
try {
  await lib.goTo(44, 65, -169, 1.2, { timeoutMs: 6000, dig: false });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(44, 65, -169, 1.5)); } catch (e2) {}
}

console.log(`At blast wall: ${lib.fmt(bot.entity.position)}`);

// Turn west towards cross bridge (38, 65, -176)
const bridgeWps = [
  new Vec3(41, 65, -173),
  new Vec3(38, 65, -176)
];

for (const wp of bridgeWps) {
  if (checkCancelled()) break;
  console.log(`Advancing to ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.5, { timeoutMs: 6000, dig: false });
  } catch (e) {
    try { await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5)); } catch (e2) {}
  }
}

console.log(`Pos near cross bridge: ${lib.fmt(bot.entity.position)}`);

// Scan for Piglins within 24m
const piglins = Object.values(bot.entities).filter(e =>
  e.isValid &&
  e.name === 'piglin' &&
  bot.entity.position.distanceTo(e.position) <= 24
);

console.log(`Found ${piglins.length} Piglins near cross bridge:`);
for (const pig of piglins) {
  console.log(`  Piglin at ${lib.fmt(pig.position)} (dist: ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m)`);
}

// Barter with Piglin if found!
const ingots = lib.count('gold_ingot');
if (ingots > 0 && piglins.length > 0) {
  piglins.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  const piglin = piglins[0];
  console.log(`Bartering ${ingots} gold ingots with neutral Piglin at ${lib.fmt(piglin.position)}...`);

  for (let round = 0; round < ingots && !checkCancelled(); round++) {
    const gold = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (!gold) break;

    bot.chat(`Beta: Tossing gold ingot #${round + 1} to neutral Piglin for Milestone 9!`);
    await bot.lookAt(piglin.position.offset(0, 1.0, 0), true);
    await bot.toss(gold.type, null, 1);
    console.log('Tossed gold ingot! Waiting 7.5s for barter drop...');
    await sleep(7500);

    // Vacuum drops
    await lib.pickup(6.0);
    const pearls = lib.count('ender_pearl');
    console.log(`Current Ender Pearls in inventory: ${pearls}`);
    if (pearls > 0) {
      bot.chat(`Beta: HARVESTED ${pearls} ENDER PEARL(S)! Milestone 9 progress!`);
    }
  }
}

// Check other drops or hostiles
const hostiles = lib.hostiles(12);
console.log(`Nearby hostiles (${hostiles.length}):`, hostiles.map(h => `${h.name} (${Math.round(h.dist)}m)`));

console.log('Inventory summary:', JSON.stringify(lib.inv()));
bot.chat(`Beta: Cross bridge status — Pos: ${lib.fmt(bot.entity.position)}, Gold ingots: ${lib.count('gold_ingot')}, Pearls: ${lib.count('ender_pearl')}`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  ender_pearls: lib.count('ender_pearl'),
  gold_ingots: lib.count('gold_ingot'),
  piglins: piglins.length
};
