// programs/495-mine-known-vein-and-craft.js
console.log('=== GAMMA: MINE KNOWN GOLD VEIN (57, 49, 3) & CRAFT BOOTS ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Configure Nether movement
const netherMoves = new Movements(bot, mcData);
const avoidBlocks = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id, mcData.blocksByName.lava?.id].filter(Boolean);
for (const id of avoidBlocks) netherMoves.blocksToAvoid.add(id);
netherMoves.canDig = true;
netherMoves.maxDropDown = 3;
netherMoves.allowParkour = true;
bot.pathfinder.setMovements(netherMoves);

const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// 2. Walk down slope towards the known rich gold vein at (57, 49, 3)
const VEIN_WAYPOINTS = [
  { x: 48, y: 56, z: -1 },
  { x: 55, y: 50, z: 3 }
];

for (const wp of VEIN_WAYPOINTS) {
  if (lib.count('gold_nugget') >= 9) break;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try { await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 6000 }); } catch (e2) {}
  }
}

// 3. Find and mine nether_gold_ore
console.log('Searching for nether_gold_ore near vein...');
const ores = bot.findBlocks({
  matching: b => b && b.name === 'nether_gold_ore',
  maxDistance: 16,
  count: 4
});

console.log(`Found ${ores.length} gold ores at vein!`);
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

console.log(`Mining complete! Nuggets: ${lib.count('gold_nugget')}, Ingots: ${lib.count('gold_ingot')}`);

// 4. Return to Crafting Table at (42, 60, -6)
console.log('Returning to Crafting Table at (42, 60, -6)...');
const RET_WAYPOINTS = [
  { x: 48, y: 56, z: -1 },
  { x: 42, y: 61, z: -6 }
];

for (const wp of RET_WAYPOINTS) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    try { await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 6000 }); } catch (e2) {}
  }
}

// 5. Locate Crafting Table
const tableBlock = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 6 });
if (tableBlock) {
  console.log('At Crafting Table at:', lib.fmt(tableBlock.position));
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
