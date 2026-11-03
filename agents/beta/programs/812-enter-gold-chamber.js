// programs/812-enter-gold-chamber.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 812: Enter Gold Chamber & Mine Vein ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Equip iron pickaxe
const pick = bot.inventory.items().find(i => i.name === 'iron_pickaxe') || bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Check blocks directly ahead towards (34, 74, -135)
console.log('Inspecting path towards (34, 74, -135)...');
for (let x = 37; x >= 33; x--) {
  for (let y = 72; y <= 75; y++) {
    for (let z = -134; z >= -136; z--) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name.includes('gold')) {
        console.log(`Gold block at (${x}, ${y}, ${z}): ${b.name}`);
      }
    }
  }
}

// Dig a clear 2-high walkway from x=37 down to x=34 at z=-134..-135, y=73..74
for (let x = 37; x >= 34 && !isCancelled(); x--) {
  for (let dy of [0, 1, 2]) {
    const target = new Vec3(x, 72 + (37 - x > 2 ? 2 : 1) + dy, -135);
    const b = bot.blockAt(target);
    if (b && b.boundingBox === 'block' && b.name !== 'air') {
      console.log(`Mining ${b.name} at ${lib.fmt(target)}...`);
      try { await bot.dig(b, true); } catch (e) {}
    }
  }
  // Step into x
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(x, Math.min(74, 72 + (37 - x)), -135));
  } catch (e) {
    await bot.lookAt(new Vec3(x, 73.5, -135), true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < 73) bot.setControlState('jump', true);
    await sleep(400);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }
  await lib.pickup(3.0);
}

// Find all gold ores within 8m
const ores = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gilded_blackstone' || b.name === 'gold_block'),
  maxDistance: 8,
  count: 20
});
console.log(`Found ${ores.length} gold ores within 8m:`, ores.map(p => lib.fmt(p)).join(', '));

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
console.log('Nuggets collected:', lib.count('gold_nugget'));

// Descend staircase back to Crafting Table at (44, 65, -134)
console.log('Descending staircase back to Crafting Table (44, 65, -134)...');
const descendPoints = [
  new Vec3(36, 72, -134),
  new Vec3(38, 70, -134),
  new Vec3(40, 68, -134),
  new Vec3(42, 66, -134),
  new Vec3(44, 65, -134)
];

for (const pt of descendPoints) {
  if (isCancelled()) break;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(pt.x, pt.y, pt.z, 1.2));
  } catch (e) {
    try { await lib.goTo(pt.x, pt.y, pt.z, 1.5, { timeoutMs: 3000 }); } catch (e2) {}
  }
}

try {
  await lib.goTo(44, 65, -134, 1.0, { timeoutMs: 4000 });
} catch (e) {}

console.log('At Crafting Table. Total nuggets:', lib.count('gold_nugget'));

// Craft gold ingots
const nuggets = lib.count('gold_nugget');
if (nuggets >= 9) {
  const ingotsToCraft = Math.floor(nuggets / 9);
  console.log(`Crafting ${ingotsToCraft} gold ingots...`);
  try {
    await lib.craft('gold_ingot', ingotsToCraft);
    bot.chat(`Beta: Crafted ${ingotsToCraft} gold ingots! Total ingots ready for bartering: ${lib.count('gold_ingot')}!`);
  } catch (e) {
    console.log('Craft error:', e.message);
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  gold_ingots: lib.count('gold_ingot'),
  gold_nuggets: lib.count('gold_nugget'),
  inv: lib.inv()
};
