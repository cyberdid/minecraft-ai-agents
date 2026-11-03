// programs/488-place-workbench-and-boots.js
console.log('=== GAMMA: PLACE WORKBENCH, CRAFT BOOTS & BARTER ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Place Crafting Table inside Nether bunker at (41, 65, -5) or nearby air spot
let tableBlock = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 12 });
if (!tableBlock && lib.count('crafting_table') > 0) {
  const placeCandidates = [
    new Vec3(41, 65, -5),
    new Vec3(42, 65, -5),
    new Vec3(42, 65, -6),
    new Vec3(41, 65, -6)
  ];
  for (const p of placeCandidates) {
    const b = bot.blockAt(p);
    const below = bot.blockAt(p.offset(0, -1, 0));
    if (b && b.name === 'air' && below && below.boundingBox === 'block') {
      try {
        await lib.place('crafting_table', p.x, p.y, p.z);
        console.log(`Placed crafting table at ${lib.fmt(p)}!`);
        bot.chat(`gamma: Placed Crafting Table in Nether bunker at ${lib.fmt(p)}!`);
        break;
      } catch (e) {
        console.log(`Place error at ${lib.fmt(p)}:`, e.message);
      }
    }
  }
}

// 2. Equip fresh stone_pickaxe
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// 3. Mine 1-2 blocks of nether_gold_ore to get >= 9 nuggets
console.log(`Current gold: ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets`);
if (lib.count('gold_nugget') < 9 && lib.count('gold_ingot') < 4) {
  const ores = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 24,
    count: 4
  });
  console.log(`Found ${ores.length} nearby gold ores.`);
  for (const orePos of ores) {
    if (lib.count('gold_nugget') >= 9) break;
    try {
      await bot.pathfinder.goto(new goals.GoalNear(orePos.x, orePos.y, orePos.z, 2.5));
      await lib.dig(orePos.x, orePos.y, orePos.z);
      await lib.pickup(3.5);
      console.log(`Mined gold ore! Nuggets: ${lib.count('gold_nugget')}`);
    } catch (e) {
      console.log('Mine warning:', e.message);
    }
  }
}

// 4. Return to crafting table and craft golden_boots
tableBlock = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 16 });
if (tableBlock) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(tableBlock.position.x, tableBlock.position.y, tableBlock.position.z, 1.5));
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

  // Craft and equip golden_boots!
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

  // Craft any remaining nuggets into ingots for bartering
  const remNuggets = lib.count('gold_nugget');
  if (remNuggets >= 9) {
    try {
      const extra = Math.floor(remNuggets / 9);
      await lib.craft('gold_ingot', extra);
      console.log(`Crafted ${extra} extra gold ingots for bartering!`);
    } catch (e) {}
  }
}

// 5. Check for Piglins to barter
const barterIngots = lib.count('gold_ingot');
console.log(`Ready for bartering! Golden boots: ${lib.count('golden_boots')}, Barter ingots: ${barterIngots}`);

if (barterIngots > 0 && lib.count('golden_boots') > 0) {
  const piglins = Object.values(bot.entities).filter(e =>
    e.isValid && e.name === 'piglin' && bot.entity.position.distanceTo(e.position) <= 20
  );

  if (piglins.length > 0) {
    console.log(`Found ${piglins.length} Piglins nearby for bartering!`);
    const piglin = piglins[0];
    try {
      await bot.pathfinder.goto(new goals.GoalNear(piglin.position.x, piglin.position.y, piglin.position.z, 3.0));
      const goldItem = bot.inventory.items().find(i => i.name === 'gold_ingot');
      if (goldItem) {
        bot.chat('gamma: Tossing gold ingot to Piglin for Ender Pearl barter!');
        await bot.lookAt(piglin.position, true);
        await bot.toss(goldItem.type, null, 1);
        console.log('Tossed gold ingot to Piglin! Waiting 8 seconds for barter drops...');
        await sleep(8000);
        await lib.pickup(5.0);
        console.log(`Barter complete! Pearls: ${lib.count('ender_pearl')}/12`);
      }
    } catch (e) {
      console.log('Barter error:', e.message);
    }
  }
}

const finalBoots = lib.count('golden_boots');
const finalPearls = lib.count('ender_pearl');
bot.chat(`gamma: Status: Golden Boots: ${finalBoots}, Ender Pearls: ${finalPearls}/12, Barter Ingots: ${lib.count('gold_ingot')}, HP: ${bot.health.toFixed(1)}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  boots: finalBoots,
  ingots: lib.count('gold_ingot'),
  pearls: finalPearls,
  inv: lib.inv()
};
