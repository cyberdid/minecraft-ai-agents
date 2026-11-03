// programs/491-mine-ridge-gold-craft-boots.js
console.log('=== GAMMA: MINE RIDGE GOLD & CRAFT GOLDEN BOOTS ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Configure safe movement along paved ridge
const netherMoves = new Movements(bot, mcData);
const avoidBlocks = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id, mcData.blocksByName.lava?.id].filter(Boolean);
for (const id of avoidBlocks) netherMoves.blocksToAvoid.add(id);
netherMoves.canDig = true;
netherMoves.maxDropDown = 2;
netherMoves.allowParkour = false;
bot.pathfinder.setMovements(netherMoves);

const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// 2. Advance to East Ridge entrance (63, 64, -7) to find gold ore
const RIDGE_STEPS = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 }
];

for (const step of RIDGE_STEPS) {
  if (lib.count('gold_nugget') >= 9 || lib.count('gold_ingot') >= 4) break;
  console.log(`Walking to ridge step (${step.x}, ${step.y}, ${step.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(step.x, step.y, step.z, 1.5));
  } catch (e) {
    try { await lib.goTo(step.x, step.y, step.z, 2.0, { timeoutMs: 6000 }); } catch (e2) {}
  }

  // Check for gold ores
  const ores = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 16,
    count: 3
  });

  if (ores.length > 0) {
    console.log(`Found ${ores.length} gold ores near step (${step.x}, ${step.z})!`);
    for (const orePos of ores) {
      if (lib.count('gold_nugget') >= 9) break;
      try {
        await bot.pathfinder.goto(new goals.GoalNear(orePos.x, orePos.y, orePos.z, 2.5));
        await lib.dig(orePos.x, orePos.y, orePos.z);
        await lib.pickup(4.0);
        console.log(`Mined gold ore at ${lib.fmt(orePos)}! Total nuggets: ${lib.count('gold_nugget')}`);
      } catch (e) {
        console.log('Mine error:', e.message);
      }
    }
  }
}

console.log(`Mining phase complete. Ingots: ${lib.count('gold_ingot')}, Nuggets: ${lib.count('gold_nugget')}`);

// 3. Return to Nether Base Camp bunker at (41, 65, -6)
console.log('Returning to bunker Crafting Table at (41, 65, -6)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(41, 65, -6, 1.2));
} catch (e) {
  try { await lib.goTo(41, 65, -6, 1.5, { timeoutMs: 8000 }); } catch (e2) {}
}

// 4. Use Crafting Table at (41, 65, -6)
const tableBlock = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 6 });
if (tableBlock) {
  console.log('At Crafting Table!');
  // Craft 4th ingot if we have 9+ nuggets
  if (lib.count('gold_nugget') >= 9 && lib.count('gold_ingot') < 4) {
    try {
      await lib.craft('gold_ingot', 4 - lib.count('gold_ingot'));
      console.log('Crafted 4th gold ingot! Total ingots:', lib.count('gold_ingot'));
    } catch (e) {
      console.log('Craft ingot error:', e.message);
    }
  }

  // Craft golden_boots!
  if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
    try {
      await lib.craft('golden_boots', 1);
      await lib.equipArmor();
      bot.chat('gamma: CRAFTED AND EQUIPPED GOLDEN BOOTS! 100% Piglin neutrality ACTIVE!');
      console.log('*** GOLDEN BOOTS EQUIPPED! PIGLIN NEUTRALITY ACTIVE! ***');
    } catch (e) {
      console.log('Craft boots error:', e.message);
    }
  }

  // Craft any extra nuggets into ingots
  const extraNuggets = lib.count('gold_nugget');
  if (extraNuggets >= 9) {
    try {
      await lib.craft('gold_ingot', Math.floor(extraNuggets / 9));
    } catch (e) {}
  }
}

const finalBoots = lib.count('golden_boots');
const finalIngots = lib.count('gold_ingot');
const finalPearls = lib.count('ender_pearl');

bot.chat(`gamma: Status: Golden Boots: ${finalBoots}, Barter Ingots: ${finalIngots}, Ender Pearls: ${finalPearls}/12, HP: ${bot.health.toFixed(1)}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  boots: finalBoots,
  ingots: finalIngots,
  pearls: finalPearls,
  inv: lib.inv()
};
