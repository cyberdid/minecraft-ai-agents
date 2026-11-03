// programs/489-pickup-nuggets-and-craft-boots.js
console.log('=== GAMMA: PICKUP NUGGETS, RETURN TO BUNKER & CRAFT BOOTS ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Vacuum items at current spot
try {
  await lib.pickup(6.0);
} catch (e) {}

let currentNuggets = lib.count('gold_nugget');
let currentIngots = lib.count('gold_ingot');
console.log(`Current gold: ${currentIngots} ingots, ${currentNuggets} nuggets`);

// 2. If under 9 nuggets and under 4 ingots, mine 1 adjacent gold ore
if (currentNuggets < 9 && currentIngots < 4) {
  const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
  if (pick) await bot.equip(pick, 'hand');

  const ores = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 12,
    count: 3
  });
  console.log(`Found ${ores.length} nearby gold ores.`);
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

currentNuggets = lib.count('gold_nugget');
currentIngots = lib.count('gold_ingot');
console.log(`Updated gold: ${currentIngots} ingots, ${currentNuggets} nuggets`);

// 3. Return to Nether Base Camp bunker at (41, 65, -6)
console.log('Navigating back to bunker at (41, 65, -6)...');
const netherMoves = new Movements(bot, mcData);
const avoidBlocks = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id, mcData.blocksByName.lava?.id].filter(Boolean);
for (const id of avoidBlocks) netherMoves.blocksToAvoid.add(id);
netherMoves.canDig = true;
netherMoves.maxDropDown = 3;
netherMoves.allowParkour = true;
bot.pathfinder.setMovements(netherMoves);

const RETURN_WAYPOINTS = [
  { x: 40, y: 60, z: -15 },
  { x: 41, y: 65, z: -6 }
];

for (const wp of RETURN_WAYPOINTS) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    try { await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 8000 }); } catch (e2) {}
  }
}

console.log('At Bunker! Pos:', lib.fmt(bot.entity.position));

// 4. Locate Crafting Table at (41, 65, -6)
const tableBlock = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 8 });
if (tableBlock) {
  console.log('Found Crafting Table at:', lib.fmt(tableBlock.position));
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

  // Craft golden_boots
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

  // Craft remaining nuggets into ingots
  const extraNuggets = lib.count('gold_nugget');
  if (extraNuggets >= 9) {
    try {
      await lib.craft('gold_ingot', Math.floor(extraNuggets / 9));
    } catch (e) {}
  }
}

// 5. Check for Piglins nearby to toss bartering gold
const barterIngots = lib.count('gold_ingot');
if (barterIngots > 0 && lib.count('golden_boots') > 0) {
  const piglins = Object.values(bot.entities).filter(e =>
    e.isValid && e.name === 'piglin' && bot.entity.position.distanceTo(e.position) <= 16
  );
  if (piglins.length > 0) {
    console.log(`Found ${piglins.length} Piglins near bunker! Bartering...`);
    const targetPiglin = piglins[0];
    try {
      await bot.pathfinder.goto(new goals.GoalNear(targetPiglin.position.x, targetPiglin.position.y, targetPiglin.position.z, 3.0));
      const goldItem = bot.inventory.items().find(i => i.name === 'gold_ingot');
      if (goldItem) {
        bot.chat('gamma: Tossing gold ingot to Piglin for Ender Pearl barter!');
        await bot.lookAt(targetPiglin.position, true);
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
