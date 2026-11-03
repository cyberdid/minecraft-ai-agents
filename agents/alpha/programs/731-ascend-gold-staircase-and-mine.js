// programs/731-ascend-gold-staircase-and-mine.js
console.log('=== Program 731: Ascend Staircase & Mine Gold Vein with Team ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain offhand shield and iron pickaxe in hand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

const pick = bot.inventory.items().find(i => i.name === 'iron_pickaxe');
if (pick) await bot.equip(pick, 'hand');

// 2. Walk along covered corridor to base of staircase at (44, 65, -134)
console.log('Walking to staircase base at (44, 65, -134)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(44.0, 65.0, -134.0, 1.0));
} catch (e) {
  try { await lib.goTo(44, 65, -134, 1.2, { timeoutMs: 6000 }); } catch (e2) {}
}

console.log('At staircase base:', lib.fmt(bot.entity.position));
bot.chat('alpha: At staircase base (44, 65, -134)! Ascending to mine gold vein with team!');

// 3. Ascend staircase: (42, 67, -134) -> (40, 69, -134) -> (38, 71, -134) -> (36, 73, -134)
const steps = [
  new Vec3(42, 67, -134),
  new Vec3(40, 69, -134),
  new Vec3(38, 71, -134),
  new Vec3(36, 73, -134)
];

for (let i = 0; i < steps.length && !checkCancelled(); i++) {
  const s = steps[i];
  console.log(`Ascending step ${i + 1}/${steps.length} to ${lib.fmt(s)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(s.x, s.y, s.z));
  } catch (e) {
    await bot.lookAt(s.offset(0.5, 1.0, 0.5), true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < s.y) bot.setControlState('jump', true);
    await sleep(400);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }
  await sleep(150);
}

console.log('At staircase top pos:', lib.fmt(bot.entity.position));

// 4. Find all nether_gold_ore blocks within 8m of current position
const ores = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gold_block'),
  maxDistance: 8,
  count: 15
});

console.log(`Found ${ores.length} gold ores within 8m of staircase top:`);
for (const p of ores) {
  const d = bot.entity.position.distanceTo(p).toFixed(1);
  console.log(` - ore at ${lib.fmt(p)} (dist: ${d}m)`);
}

// 5. Mine all detected gold ores
let mined = 0;
for (const p of ores) {
  if (checkCancelled()) break;
  console.log(`Mining gold ore at ${lib.fmt(p)}...`);
  try {
    if (pick) await bot.equip(pick, 'hand');
    await lib.dig(p.x, p.y, p.z);
    mined++;
    await sleep(250);
    await lib.pickup(4.0);
  } catch (err) {
    console.log(`Mine error at ${lib.fmt(p)}:`, err.message);
  }
}

// 6. Vacuum all nuggets and items
await lib.pickup(6.0);
console.log(`Mined ${mined} gold ores! Inventory:`, lib.inv());

// 7. Craft ingots if we have 9+ nuggets
const nuggets = lib.count('gold_nugget');
console.log(`Total gold nuggets: ${nuggets}`);
if (nuggets >= 9) {
  try {
    const toCraft = Math.floor(nuggets / 9);
    await lib.craft('gold_ingot', toCraft);
    console.log(`Crafted ${toCraft} gold ingots! Total ingots: ${lib.count('gold_ingot')}`);
    bot.chat(`alpha: Crafted ${toCraft} gold ingots from mined ore! Total ingots: ${lib.count('gold_ingot')}`);
  } catch (e) {
    console.log('Craft ingots note:', e.message);
  }
}

// 8. If Alpha has 4+ ingots and no golden_boots, craft golden_boots!
const ingots = lib.count('gold_ingot');
if (ingots >= 4 && bot.inventory.slots[8]?.name !== 'golden_boots') {
  try {
    await lib.craft('golden_boots', 1);
    const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) await bot.equip(gb, 'feet');
    bot.chat('alpha: [SUIT UP] Crafted and equipped golden_boots! 100% Piglin neutrality ACTIVE!');
  } catch (e) {
    console.log('Craft boots note:', e.message);
  }
}

bot.chat(`alpha: Gold mining complete! Gold ingots: ${lib.count('gold_ingot')}, Nuggets: ${lib.count('gold_nugget')}, HP: ${bot.health.toFixed(1)}/20`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  mined,
  goldIngots: lib.count('gold_ingot'),
  goldNuggets: lib.count('gold_nugget'),
  inv: lib.inv()
};
