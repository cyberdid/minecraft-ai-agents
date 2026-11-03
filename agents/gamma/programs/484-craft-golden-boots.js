// programs/484-craft-golden-boots.js
console.log('=== GAMMA: FINISH GOLD HARVEST & CRAFT GOLDEN BOOTS ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Pickup nearby items (nuggets on the ground)
try {
  await lib.pickup(4.5);
} catch (e) {}

let currentNuggets = lib.count('gold_nugget');
let currentIngots = lib.count('gold_ingot');
console.log(`Current gold: ${currentNuggets} nuggets, ${currentIngots} ingots`);

// 2. Mine 1-2 more nether_gold_ore if under 36 nuggets
if (currentNuggets + currentIngots * 9 < 36) {
  const ores = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 16,
    count: 3
  });
  console.log(`Found ${ores.length} nearby nether_gold_ore blocks.`);
  const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
  if (pick) await bot.equip(pick, 'hand');

  for (const orePos of ores) {
    if (lib.count('gold_nugget') + lib.count('gold_ingot') * 9 >= 36) break;
    try {
      await bot.pathfinder.goto(new goals.GoalNear(orePos.x, orePos.y, orePos.z, 2.5));
      await lib.dig(orePos.x, orePos.y, orePos.z);
      await lib.pickup(3.5);
    } catch (e) {
      console.log('Mine ore warning:', e.message);
    }
  }
}

currentNuggets = lib.count('gold_nugget');
currentIngots = lib.count('gold_ingot');
console.log(`Updated gold: ${currentNuggets} nuggets, ${currentIngots} ingots`);

// 3. Return to Nether Base Camp bunker at (40, 65, -7)
console.log('Navigating back to Nether Base Camp bunker at (42, 65, -7)...');
const netherMoves = new Movements(bot, mcData);
const avoidBlocks = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id, mcData.blocksByName.lava?.id].filter(Boolean);
for (const id of avoidBlocks) netherMoves.blocksToAvoid.add(id);
netherMoves.canDig = true;
netherMoves.maxDropDown = 3;
netherMoves.allowParkour = false;
bot.pathfinder.setMovements(netherMoves);

try {
  await bot.pathfinder.goto(new goals.GoalNear(42, 65, -7, 1.5));
} catch (e) {
  try { await lib.goToXZ(42, -7, { timeoutMs: 12000 }); } catch (e2) {}
}

console.log('At Bunker! Pos:', lib.fmt(bot.entity.position));

// 4. Find or craft/place crafting table
let tableBlock = bot.findBlock({
  matching: b => b && b.name === 'crafting_table',
  maxDistance: 16
});

if (!tableBlock && bot.game.dimension === 'the_nether') {
  console.log('Checking for crafting table or logs...');
  // If no table in Nether bunker, we can step through portal to Overworld base (295, 72, -56) which has crafting table!
  if (lib.count('crafting_table') === 0 && lib.count('*_planks') < 4) {
    console.log('Stepping through return portal to use Base crafting table...');
    const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 10 });
    if (portalBlock) {
      try { await bot.pathfinder.goto(new goals.GoalNear(portalBlock.position.x, portalBlock.position.y, portalBlock.position.z, 0.4)); } catch (e) {}
      const warpStart = Date.now();
      while (bot.game.dimension === 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
        await sleep(250);
      }
    }
  }
}

// 5. In Overworld Base or Nether with crafting table: craft ingots and golden_boots
console.log('Crafting ingots and golden_boots...');
try {
  const totalNuggets = lib.count('gold_nugget');
  const neededIngots = 4 - lib.count('gold_ingot');
  if (neededIngots > 0 && totalNuggets >= neededIngots * 9) {
    await lib.craft('gold_ingot', neededIngots);
    console.log(`Crafted ${neededIngots} gold ingots!`);
  }
  if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
    await lib.craft('golden_boots', 1);
    await lib.equipArmor();
    bot.chat('gamma: CRAFTED AND EQUIPPED GOLDEN BOOTS! 100% Piglin neutrality achieved!');
    console.log('Golden boots successfully equipped!');
  }
} catch (e) {
  console.log('Craft error:', e.message);
}

// Craft remaining nuggets into gold ingots for bartering
try {
  const remNuggets = lib.count('gold_nugget');
  if (remNuggets >= 9) {
    const extraIngots = Math.floor(remNuggets / 9);
    await lib.craft('gold_ingot', extraIngots);
    console.log(`Crafted ${extraIngots} additional gold ingots for Piglin bartering!`);
  }
} catch (e) {}

const finalBoots = lib.count('golden_boots');
const finalIngots = lib.count('gold_ingot');
bot.chat(`gamma: Gear status: Golden Boots: ${finalBoots}, Gold Ingots for bartering: ${finalIngots}, HP: ${bot.health.toFixed(1)}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  nuggets: lib.count('gold_nugget'),
  ingots: finalIngots,
  boots: finalBoots,
  inv: lib.inv()
};
