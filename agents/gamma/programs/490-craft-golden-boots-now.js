// programs/490-craft-golden-boots-now.js
console.log('=== GAMMA: CRAFT GOLDEN BOOTS & INITIALIZE BARTERING ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Pickup any nearby items in bunker
try { await lib.pickup(5.0); } catch (e) {}

console.log(`Current gold: ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets, boots: ${lib.count('golden_boots')}`);

// 2. If under 9 nuggets and under 4 ingots, mine 1 adjacent gold ore
if (lib.count('gold_nugget') < 9 && lib.count('gold_ingot') < 4) {
  const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
  if (pick) await bot.equip(pick, 'hand');

  const ores = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 16,
    count: 3
  });
  console.log(`Found ${ores.length} nearby gold ores.`);
  for (const orePos of ores) {
    if (lib.count('gold_nugget') >= 9) break;
    try {
      await bot.pathfinder.goto(new goals.GoalNear(orePos.x, orePos.y, orePos.z, 2.5));
      await lib.dig(orePos.x, orePos.y, orePos.z);
      await lib.pickup(4.0);
      console.log(`Mined gold ore! Total nuggets: ${lib.count('gold_nugget')}`);
    } catch (e) {
      console.log('Mine error:', e.message);
    }
  }
}

// 3. Return to Crafting Table at (41, 65, -6)
const tableBlock = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 12 });
if (tableBlock) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(tableBlock.position.x, tableBlock.position.y, tableBlock.position.z, 1.2));
  } catch (e) {}

  // Craft 4th ingot if needed
  if (lib.count('gold_nugget') >= 9 && lib.count('gold_ingot') < 4) {
    try {
      await lib.craft('gold_ingot', 4 - lib.count('gold_ingot'));
      console.log('Crafted gold ingot! Total ingots:', lib.count('gold_ingot'));
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
      console.log('Craft golden_boots error:', e.message);
    }
  }

  // Craft extra nuggets into ingots
  const extraNuggets = lib.count('gold_nugget');
  if (extraNuggets >= 9) {
    try {
      await lib.craft('gold_ingot', Math.floor(extraNuggets / 9));
    } catch (e) {}
  }
}

// 4. Barter with Piglins if any nearby
const barterIngots = lib.count('gold_ingot');
if (barterIngots > 0 && lib.count('golden_boots') > 0) {
  const piglins = Object.values(bot.entities).filter(e =>
    e.isValid && e.name === 'piglin' && bot.entity.position.distanceTo(e.position) <= 20
  );
  if (piglins.length > 0) {
    console.log(`Found ${piglins.length} Piglins near bunker! Tossing gold ingot...`);
    const piglin = piglins[0];
    try {
      await bot.pathfinder.goto(new goals.GoalNear(piglin.position.x, piglin.position.y, piglin.position.z, 3.0));
      const goldItem = bot.inventory.items().find(i => i.name === 'gold_ingot');
      if (goldItem) {
        bot.chat('gamma: Tossing gold ingot to Piglin for Ender Pearl barter!');
        await bot.lookAt(piglin.position, true);
        await bot.toss(goldItem.type, null, 1);
        await sleep(8000);
        await lib.pickup(5.0);
      }
    } catch (e) {}
  }
}

const finalBoots = lib.count('golden_boots');
const finalIngots = lib.count('gold_ingot');
const finalPearls = lib.count('ender_pearl');

bot.chat(`gamma: Status: Golden Boots: ${finalBoots}, Ender Pearls: ${finalPearls}/12, Barter Ingots: ${finalIngots}, HP: ${bot.health.toFixed(1)}`);

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
