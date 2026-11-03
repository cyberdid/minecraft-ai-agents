// programs/496-unite-with-delta-and-craft.js
console.log('=== GAMMA: UNITE WITH DELTA IN BUNKER & CRAFT BOOTS ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Configure Nether movement up to bunker
const netherMoves = new Movements(bot, mcData);
const avoidBlocks = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id, mcData.blocksByName.lava?.id].filter(Boolean);
for (const id of avoidBlocks) netherMoves.blocksToAvoid.add(id);
netherMoves.canDig = true;
netherMoves.maxDropDown = 3;
netherMoves.allowParkour = true;
bot.pathfinder.setMovements(netherMoves);

// 2. Ascend to bunker (41, 65, -6)
const CLIMB_STEPS = [
  { x: 48, y: 56, z: -1 },
  { x: 44, y: 61, z: -4 },
  { x: 41, y: 65, z: -6 }
];

for (const step of CLIMB_STEPS) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(step.x, step.y, step.z, 1.5));
  } catch (e) {
    try { await lib.goTo(step.x, step.y, step.z, 2.0, { timeoutMs: 7000 }); } catch (e2) {}
  }
}

console.log('At Bunker! Pos:', lib.fmt(bot.entity.position));

// 3. Vacuum all items within 6m
try {
  await lib.pickup(6.0);
} catch (e) {}

let totalNuggets = lib.count('gold_nugget');
let totalIngots = lib.count('gold_ingot');
console.log(`Current gold: ${totalIngots} ingots, ${totalNuggets} nuggets`);
bot.chat(`gamma: Reunited with team at bunker (41, 65, -6)! Holding ${totalIngots} ingots, ${totalNuggets} nuggets.`);

// 4. Locate Crafting Table at (41, 65, -6)
const tableBlock = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 6 });
if (tableBlock) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(tableBlock.position.x, tableBlock.position.y, tableBlock.position.z, 1.2));
  } catch (e) {}

  // Craft ingot from nuggets if we have 9+
  if (lib.count('gold_nugget') >= 9) {
    try {
      const craftCount = Math.floor(lib.count('gold_nugget') / 9);
      await lib.craft('gold_ingot', craftCount);
      console.log(`Crafted ${craftCount} gold ingots!`);
    } catch (e) {}
  }

  // Craft and equip golden_boots if we have 4+ ingots
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
}

// 5. If Gamma has 3 ingots and Delta is nearby with 1 ingot:
// Check if Delta is within 4m
const deltaEntity = Object.values(bot.entities).find(e =>
  e.isValid && e.type === 'player' && e.username === 'delta' && bot.entity.position.distanceTo(e.position) <= 6
);

if (deltaEntity && lib.count('golden_boots') === 0 && lib.count('gold_ingot') === 3) {
  console.log('Delta is at the table with 1 ingot! Pooling ingots...');
  bot.chat('gamma: Delta, pooling our gold at the crafting table to equip golden_boots!');
  // Wait to see if Delta drops 1 ingot, or pickup
  await sleep(2000);
  try { await lib.pickup(5.0); } catch (e) {}

  // If still 3 ingots, toss 3 ingots to Delta so Delta has 4 ingots to craft golden_boots!
  if (lib.count('gold_ingot') === 3 && lib.count('golden_boots') === 0) {
    const goldItem = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (goldItem) {
      console.log('Tossing 3 ingots to Delta so team gets golden_boots immediately!');
      bot.chat('gamma: Tossed 3 gold ingots to Delta! Delta now has 4 ingots to craft golden_boots!');
      await bot.lookAt(deltaEntity.position, true);
      await bot.toss(goldItem.type, null, 3);
      await sleep(1000);
    }
  }
}

// 6. Check for Piglins nearby to barter
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

bot.chat(`gamma: Team coordination complete. Golden Boots: ${finalBoots}, Barter Ingots: ${finalIngots}, Ender Pearls: ${finalPearls}/12, HP: ${bot.health.toFixed(1)}`);

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
