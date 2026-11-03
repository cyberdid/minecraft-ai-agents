// programs/498-climb-to-bunker-and-craft-boots.js
console.log('=== GAMMA: CLIMB TO BUNKER, PICKUP INGOT & CRAFT BOOTS ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Configure movements for climbing up to bunker
const netherMoves = new Movements(bot, mcData);
const avoidBlocks = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id, mcData.blocksByName.lava?.id].filter(Boolean);
for (const id of avoidBlocks) netherMoves.blocksToAvoid.add(id);
netherMoves.canDig = true;
netherMoves.maxDropDown = 4;
netherMoves.allowParkour = true;
bot.pathfinder.setMovements(netherMoves);

// 2. Climb up slope waypoints to bunker
const CLIMB_WAYPOINTS = [
  { x: 52, y: 62, z: 0 },
  { x: 46, y: 65, z: -5 },
  { x: 42, y: 60, z: -6 }
];

for (const wp of CLIMB_WAYPOINTS) {
  console.log(`Navigating to (${wp.x}, ${wp.y}, ${wp.z}) from`, lib.fmt(bot.entity.position));
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 12000 });
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
    } catch (e2) {}
  }
}

console.log('Arrived at bunker trench! Pos:', lib.fmt(bot.entity.position));

// 3. Vacuum dropped gold ingot from Alpha / floor
try {
  await lib.pickup(6.0);
} catch (e) {}

let totalIngots = lib.count('gold_ingot');
let totalNuggets = lib.count('gold_nugget');
console.log(`Gold count at bunker: ${totalIngots} ingots, ${totalNuggets} nuggets`);

// 4. Locate Crafting Table at (42, 60, -6) or (41, 65, -6)
const tableBlock = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 8 });
if (tableBlock) {
  console.log('Found Crafting Table at:', lib.fmt(tableBlock.position));
  try {
    await bot.pathfinder.goto(new goals.GoalNear(tableBlock.position.x, tableBlock.position.y, tableBlock.position.z, 1.2));
  } catch (e) {}

  // If we have 9+ nuggets, craft an ingot
  if (lib.count('gold_nugget') >= 9) {
    try {
      await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
      console.log('Crafted gold ingot from nuggets! Total ingots:', lib.count('gold_ingot'));
    } catch (e) {}
  }

  // Craft golden_boots if we have 4+ ingots
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

  // Craft any remaining nuggets into ingots
  if (lib.count('gold_nugget') >= 9) {
    try {
      await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
    } catch (e) {}
  }
}

// 5. Check for Piglins nearby to toss bartering gold
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
      }
    } catch (e) {}
  }
}

const finalBoots = lib.count('golden_boots');
const finalIngots = lib.count('gold_ingot');
const finalPearls = lib.count('ender_pearl');

bot.chat(`gamma: Status check: Golden Boots: ${finalBoots}, Barter Ingots: ${finalIngots}, Ender Pearls: ${finalPearls}/12, HP: ${bot.health.toFixed(1)}`);

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
