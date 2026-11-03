// programs/811-climb-staircase-and-harvest-gold.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 811: Climb Team Staircase & Harvest Gold ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); } catch (e) {}
  }
}
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(sh, 'off-hand'); } catch (e) {}
}
const pick = bot.inventory.items().find(i => i.name === 'iron_pickaxe') || bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Step 1: Walk to staircase entrance at (44, 65, -134)
console.log('Walking to staircase base at (44, 65, -134)...');
try {
  await lib.goTo(44, 65, -134, 1.0, { timeoutMs: 4000 });
} catch (e) {}

// Step 2: Ascend staircase going West (-X) and Up (+Y) at z=-134
const stairs = [
  new Vec3(43, 65, -134),
  new Vec3(42, 66, -134),
  new Vec3(41, 67, -134),
  new Vec3(40, 68, -134),
  new Vec3(39, 69, -134),
  new Vec3(38, 70, -134),
  new Vec3(37, 71, -134),
  new Vec3(36, 72, -134),
  new Vec3(35, 73, -134),
  new Vec3(34, 74, -135) // Gold vein chamber
];

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

for (let i = 0; i < stairs.length && !isCancelled(); i++) {
  const step = stairs[i];
  console.log(`Ascending to step ${i + 1}/${stairs.length}: ${lib.fmt(step)}`);
  
  // Clear any obstructing blocks in head clearance (y and y+1)
  for (let dy of [0, 1]) {
    const b = bot.blockAt(new Vec3(step.x, step.y + dy, step.z));
    if (b && b.boundingBox === 'block' && b.name !== 'air') {
      try { await bot.dig(b, true); } catch (e) {}
    }
  }

  try {
    await bot.pathfinder.goto(new goals.GoalBlock(step.x, step.y, step.z));
  } catch (e) {
    await bot.lookAt(new Vec3(step.x + 0.5, step.y + 1.0, step.z + 0.5), true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < step.y) bot.setControlState('jump', true);
    await sleep(400);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }

  await lib.pickup(3.0);
}

console.log('Pos at top of staircase:', lib.fmt(bot.entity.position));

// Step 3: Scan for reachable nether_gold_ore blocks
const ores = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gilded_blackstone'),
  maxDistance: 6,
  count: 15
});
console.log(`Found ${ores.length} gold ores reachable:`, ores.map(p => lib.fmt(p)).join(', '));

for (const op of ores) {
  if (isCancelled()) break;
  const b = bot.blockAt(op);
  if (b && b.name.includes('gold')) {
    console.log(`Mining gold ore at ${lib.fmt(op)}...`);
    try {
      await bot.dig(b, true);
    } catch (e) {
      console.log('Dig error:', e.message);
    }
  }
}

// Vacuum all dropped nuggets
await lib.pickup(6.0);
console.log(`Total gold nuggets collected: ${lib.count('gold_nugget')}`);

// Step 4: Descend staircase back to Crafting Table at (44, 65, -134)
console.log('Descending back to Crafting Table at (44, 65, -134)...');
const revStairs = [...stairs].reverse();
for (const step of revStairs) {
  if (isCancelled()) break;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(step.x, step.y, step.z, 1.2));
  } catch (e) {
    try { await lib.goTo(step.x, step.y, step.z, 1.5, { timeoutMs: 3000 }); } catch (e2) {}
  }
}

try {
  await lib.goTo(44, 65, -134, 1.0, { timeoutMs: 4000 });
} catch (e) {}

console.log('Back at Crafting Table area:', lib.fmt(bot.entity.position));

// Step 5: Craft gold nuggets into gold ingots
const nuggets = lib.count('gold_nugget');
if (nuggets >= 9) {
  const craftCount = Math.floor(nuggets / 9);
  console.log(`Crafting ${craftCount} gold ingots at crafting table...`);
  try {
    await lib.craft('gold_ingot', craftCount);
    console.log(`Crafted! Total gold ingots now: ${lib.count('gold_ingot')}`);
    bot.chat(`Beta: Crafted ${craftCount} gold ingots! Total ingots ready for bartering: ${lib.count('gold_ingot')}!`);
  } catch (e) {
    console.log('Craft gold_ingot error:', e.message);
  }
}

console.log('=== Program 811 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Gold ingots:', lib.count('gold_ingot'));
console.log('Gold nuggets:', lib.count('gold_nugget'));
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  gold_ingots: lib.count('gold_ingot'),
  gold_nuggets: lib.count('gold_nugget')
};
