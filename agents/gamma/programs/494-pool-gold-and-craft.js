// programs/494-pool-gold-and-craft.js
console.log('=== GAMMA: POOL GOLD IN BUNKER & CRAFT GOLDEN BOOTS ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Vacuum all items within 6m in the bunker/trench
try {
  await lib.pickup(6.0);
} catch (e) {}

let totalNuggets = lib.count('gold_nugget');
let totalIngots = lib.count('gold_ingot');
console.log(`Current gold after pickup: ${totalIngots} ingots, ${totalNuggets} nuggets`);

// 2. If we need just 2 more nuggets and an ore is within 8m, mine it quickly
if (totalIngots < 4 && totalNuggets < 9) {
  const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
  if (pick) await bot.equip(pick, 'hand');

  const ores = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 12,
    count: 2
  });

  if (ores.length > 0) {
    console.log(`Found ${ores.length} nearby gold ores! Mining...`);
    for (const orePos of ores) {
      if (lib.count('gold_nugget') >= 9) break;
      try {
        await bot.pathfinder.goto(new goals.GoalNear(orePos.x, orePos.y, orePos.z, 2.5));
        await lib.dig(orePos.x, orePos.y, orePos.z);
        await lib.pickup(4.0);
        console.log(`Mined gold ore at ${lib.fmt(orePos)}! Total nuggets: ${lib.count('gold_nugget')}`);
      } catch (e) {}
    }
  }
}

totalNuggets = lib.count('gold_nugget');
totalIngots = lib.count('gold_ingot');
console.log(`Gold ready for crafting: ${totalIngots} ingots, ${totalNuggets} nuggets`);

// 3. Locate Crafting Table (either at y=60 or y=65)
const tableBlock = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 10 });
if (tableBlock) {
  console.log('Found Crafting Table at:', lib.fmt(tableBlock.position));
  try {
    await bot.pathfinder.goto(new goals.GoalNear(tableBlock.position.x, tableBlock.position.y, tableBlock.position.z, 1.2));
  } catch (e) {}

  // Craft ingots from nuggets
  if (lib.count('gold_nugget') >= 9) {
    const ingotsToCraft = Math.floor(lib.count('gold_nugget') / 9);
    try {
      await lib.craft('gold_ingot', ingotsToCraft);
      console.log(`Crafted ${ingotsToCraft} gold ingots! Total ingots: ${lib.count('gold_ingot')}`);
    } catch (e) {
      console.log('Craft ingot error:', e.message);
    }
  }

  // Craft and equip golden_boots!
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

  // Craft extra nuggets into ingots
  if (lib.count('gold_nugget') >= 9) {
    try {
      await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
    } catch (e) {}
  }
}

// 4. If Gamma has golden_boots and surplus ingots, barter with Piglins
const barterIngots = lib.count('gold_ingot');
if (barterIngots > 0 && lib.count('golden_boots') > 0) {
  const piglins = Object.values(bot.entities).filter(e =>
    e.isValid && e.name === 'piglin' && bot.entity.position.distanceTo(e.position) <= 20
  );

  if (piglins.length > 0) {
    console.log(`Found ${piglins.length} Piglins nearby! Bartering...`);
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
        console.log(`Barter complete! Pearls held: ${lib.count('ender_pearl')}/12`);
      }
    } catch (e) {}
  }
}

const finalBoots = lib.count('golden_boots');
const finalIngots = lib.count('gold_ingot');
const finalPearls = lib.count('ender_pearl');

bot.chat(`gamma: Bunker status: Golden Boots: ${finalBoots}, Barter Ingots: ${finalIngots}, Ender Pearls: ${finalPearls}/12, HP: ${bot.health.toFixed(1)}`);

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
