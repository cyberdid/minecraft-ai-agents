// programs/629-mine-gold-and-barter.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 629: MINE NETHER GOLD & BARTER FOR PEARLS ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

if (bot.game.dimension !== 'the_nether') {
  console.log('Not in Nether!');
  return { dim: bot.game.dimension };
}

// Step 1: Equip iron pickaxe
const pick = bot.inventory.items().find(i => i.name === 'iron_pickaxe') ||
             bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Step 2: Step to staircase top at (36, 73, -134)
console.log('Approaching ore vein at (36, 73, -134)...');
try {
  await lib.goTo(36, 73, -134, 1.2, { timeoutMs: 6000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(36, 73, -134, 1.0)); } catch (e2) {}
}

console.log('At vein top pos:', lib.fmt(bot.entity.position));

// Step 3: Find and mine all nether_gold_ore blocks
const ores = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gold_block'),
  maxDistance: 8.0,
  count: 25
});
console.log(`Found ${ores.length} nether_gold_ore blocks!`);

for (const op of ores) {
  if (isCancelled()) break;
  console.log(`Mining nether_gold_ore at ${lib.fmt(op)}...`);
  try {
    if (pick) await bot.equip(pick, 'hand');
    await lib.dig(op.x, op.y, op.z);
    await lib.pickup(3.5);
  } catch (e) {
    console.log(`Dig note at ${lib.fmt(op)}:`, e.message);
  }
}

// Step 4: Dig forward 1-2 blocks to expose any hidden gold ore in vein
for (let targetX = 35; targetX >= 33 && !isCancelled(); targetX--) {
  for (let dy = 0; dy <= 2; dy++) {
    for (let targetZ = -134; targetZ >= -136; targetZ--) {
      const b = bot.blockAt(new Vec3(targetX, 73 + dy, targetZ));
      if (b && (b.name === 'netherrack' || b.name === 'nether_gold_ore')) {
        try {
          if (pick) await bot.equip(pick, 'hand');
          await bot.dig(b);
          if (b.name === 'nether_gold_ore') await lib.pickup(3.5);
        } catch (e) {}
      }
    }
  }
}

// Vacuum all drops
await lib.pickup(5.0);
const nuggets = lib.count('gold_nugget');
console.log(`Harvested gold! Total gold_nugget in inv: ${nuggets}`);
bot.chat(`gamma: Mined Nether gold vein! Total gold nuggets: ${nuggets}. Returning down staircase to bunker crafting table!`);

// Step 5: Return down staircase to Bunker Crafting Table at (44, 65, -134)
console.log('Returning down staircase to Bunker Crafting Table at (44, 65, -134)...');
try {
  await lib.goTo(44, 65, -134, 1.2, { dig: false, timeoutMs: 10000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(44, 65, -134, 1.0)); } catch (e2) {}
}

console.log('At Bunker Crafting Table. Pos:', lib.fmt(bot.entity.position));

// Step 6: Craft gold ingots from nuggets
const totalNuggets = lib.count('gold_nugget');
if (totalNuggets >= 9) {
  try {
    const crafts = Math.floor(totalNuggets / 9);
    console.log(`Crafting ${crafts} gold_ingot(s)...`);
    await lib.craft('gold_ingot', crafts);
    console.log(`SUCCESS: Crafted ${crafts} gold_ingot! Total in inv: ${lib.count('gold_ingot')}`);
    bot.chat(`gamma: Crafted ${crafts} gold ingots! Total ingots: ${lib.count('gold_ingot')}. Ready to barter!`);
  } catch (e) {
    console.log('Craft gold_ingot error:', e.message);
  }
}

// Step 7: Step into covered tunnel at (44, 65, -135..-145) to barter with neutral Piglins
const ingotsToBarter = lib.count('gold_ingot');
console.log(`Ingots available to barter: ${ingotsToBarter}`);

if (ingotsToBarter > 0) {
  try {
    await lib.goTo(44, 65, -140, 2.0, { dig: false, timeoutMs: 6000 });
  } catch (e) {}

  const piglins = Object.values(bot.entities).filter(e =>
    e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 16
  );
  console.log(`Nearby Piglins: ${piglins.length}`);

  if (piglins.length > 0) {
    const targetPiglin = piglins[0];
    console.log(`Bartering with Piglin at ${lib.fmt(targetPiglin.position)}!`);
    bot.chat('gamma: Neutral Piglin found in covered tunnel! Tossing gold ingot for Ender Pearls!');

    for (let r = 0; r < ingotsToBarter && !isCancelled(); r++) {
      try {
        const ingot = bot.inventory.items().find(i => i.name === 'gold_ingot');
        if (!ingot) break;

        await bot.lookAt(targetPiglin.position.offset(0, 1.0, 0), true);
        await bot.equip(mcData.itemsByName.gold_ingot.id, 'hand');
        bot.tossStack(bot.heldItem);
        console.log(`Tossed gold ingot ${r + 1}/${ingotsToBarter}! Waiting 8s for drop...`);
        await sleep(8000);
        await lib.pickup(5.0);
        console.log(`Barter round ${r + 1} complete! Pearls now: ${lib.count('ender_pearl')}`);
      } catch (e) {
        console.log('Barter note:', e.message);
      }
    }
  } else {
    console.log('No Piglin within 16m of covered tunnel.');
    bot.chat('gamma: No Piglins in immediate tunnel. Holding gold ingots ready for bartering!');
  }
}

// Step 8: Final pickup & status report
await lib.pickup(5.0);
const finalPearls = lib.count('ender_pearl');
console.log(`=== END PROGRAM 629: Pearls: ${finalPearls}/12, Ingots: ${lib.count('gold_ingot')}, HP: ${bot.health.toFixed(1)}, Food: ${bot.food} ===`);
bot.chat(`gamma: Milestone 9 status — Pearls: ${finalPearls}/12, Gold ingots: ${lib.count('gold_ingot')}, HP: ${bot.health.toFixed(1)}/20.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls: finalPearls,
  goldIngots: lib.count('gold_ingot'),
  goldNuggets: lib.count('gold_nugget'),
  inv: lib.inv()
};
