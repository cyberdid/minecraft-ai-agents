// programs/540-mine-gold-vein.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 540: MINE GOLD VEIN ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Equip iron pickaxe
const pick = bot.inventory.items().find(i => i.name === 'iron_pickaxe') ||
             bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Step 2: Walk up the excavated staircase to (36, 73, -134)
console.log('Ascending staircase to x=36, y=73, z=-134...');
const steps = [
  new Vec3(42, 67, -134),
  new Vec3(40, 69, -134),
  new Vec3(38, 71, -134),
  new Vec3(36, 73, -134)
];

for (const s of steps) {
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
}

console.log('At staircase top pos:', lib.fmt(bot.entity.position));

// Step 3: Dig forward into x=35 and x=34 at y=73..75, z=-134..-136
for (let targetX = 35; targetX >= 33 && !isCancelled(); targetX--) {
  for (let dy = 0; dy <= 2; dy++) {
    for (let targetZ = -134; targetZ >= -136; targetZ--) {
      const b = bot.blockAt(new Vec3(targetX, 73 + dy, targetZ));
      if (b && b.name !== 'air' && b.boundingBox === 'block') {
        try {
          if (pick) await bot.equip(pick, 'hand');
          await bot.dig(b);
        } catch (e) {}
      }
    }
  }
}

// Step 4: Scan and mine all reachable nether_gold_ore
const ores = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gold_block'),
  maxDistance: 6.0,
  count: 15
});

console.log(`Reachable nether_gold_ore blocks: ${ores.length}`);
for (const op of ores) {
  if (isCancelled()) break;
  console.log(`Mining nether_gold_ore at ${lib.fmt(op)}...`);
  try {
    if (pick) await bot.equip(pick, 'hand');
    await lib.dig(op.x, op.y, op.z);
    await lib.pickup(4.0);
  } catch (e) {
    console.log('Dig note:', e.message);
  }
}

// Step 5: Vacuum all drops
await lib.pickup(6.0);
const nuggets = lib.count('gold_nugget');
console.log(`Harvested gold nuggets! Total in inventory: ${nuggets}`);

// Step 6: Return down staircase to Bunker Crafting Table at (44, 65, -134)
console.log('Returning down staircase to bunker crafting table at (44, 65, -134)...');
try {
  await lib.goTo(44, 65, -134, 1.5, { dig: false, timeoutMs: 10000 });
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(44, 65, -134, 1.0));
  } catch (e2) {}
}

console.log('At Crafting Table. Pos:', lib.fmt(bot.entity.position));

// Step 7: Craft gold ingots
if (lib.count('gold_nugget') >= 9) {
  try {
    const crafts = Math.floor(lib.count('gold_nugget') / 9);
    await lib.craft('gold_ingot', crafts);
    console.log(`Crafted ${crafts} gold_ingot! Total: ${lib.count('gold_ingot')}`);
    bot.chat(`gamma: Harvested Nether gold! Crafted ${crafts} gold ingots! Total ingots: ${lib.count('gold_ingot')}. Ready to barter with Piglins!`);
  } catch (e) {
    console.log('Crafting error:', e.message);
  }
}

console.log('Current Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  goldNuggets: lib.count('gold_nugget'),
  goldIngots: lib.count('gold_ingot'),
  inv: lib.inv()
};
