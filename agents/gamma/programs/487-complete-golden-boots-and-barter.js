// programs/487-complete-golden-boots-and-barter.js
console.log('=== GAMMA: HARVEST NUGGETS & COMPLETE GOLDEN BOOTS ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Ensure pickaxe equipped
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// 2. Mine 1-2 blocks of nether_gold_ore to get >= 9 nuggets
console.log(`Current gold: ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets`);
if (lib.count('gold_nugget') < 9 && bot.game.dimension === 'the_nether') {
  const ores = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 24,
    count: 5
  });
  console.log(`Found ${ores.length} gold ores.`);
  for (const orePos of ores) {
    if (lib.count('gold_nugget') >= 9) break;
    try {
      await bot.pathfinder.goto(new goals.GoalNear(orePos.x, orePos.y, orePos.z, 2.5));
      await lib.dig(orePos.x, orePos.y, orePos.z);
      await lib.pickup(3.5);
      console.log(`Mined gold ore at ${lib.fmt(orePos)}! Total nuggets: ${lib.count('gold_nugget')}`);
    } catch (e) {
      console.log('Mine error:', e.message);
    }
  }
}

console.log(`Gold after mining: ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets`);

// 3. Check for crafting table in Nether
let tableBlock = bot.findBlock({
  matching: b => b && b.name === 'crafting_table',
  maxDistance: 20
});

// If no crafting table in Nether bunker, use the Overworld base crafting table
if (!tableBlock && bot.game.dimension === 'the_nether') {
  console.log('No crafting table in Nether bunker. Stepping through portal to Base (295, 72, -56)...');
  const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
  if (portalBlock) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(portalBlock.position.x, portalBlock.position.y, portalBlock.position.z, 0.4));
    } catch (e) {
      await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
      bot.setControlState('forward', true);
      await sleep(1000);
      bot.setControlState('forward', false);
    }

    const warpStart = Date.now();
    while (bot.game.dimension === 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
      await sleep(250);
    }
  }
}

// 4. In Overworld Base: withdraw crafting table and craft golden_boots
if (bot.game.dimension === 'overworld') {
  console.log('In Overworld! Walking into base house...');
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -55.5, 0.5));
    await lib.door(294, 72, -54, false);
  } catch (e) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
  }

  // Withdraw crafting_table from chest so we can place one in Nether bunker too
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openContainer(chestBlock);
      const ctItem = chest.containerItems().find(i => i.name === 'crafting_table');
      if (ctItem) await chest.withdraw(ctItem.type, null, 1);
      // Also check if any food
      const foodItem = chest.containerItems().find(i => ['cooked_beef', 'cooked_porkchop', 'bread'].includes(i.name));
      if (foodItem) await chest.withdraw(foodItem.type, null, Math.min(4, foodItem.count));
      chest.close();
    } catch (e) {}
  }

  // Craft 4th gold_ingot and golden_boots
  try {
    if (lib.count('gold_nugget') >= 9 && lib.count('gold_ingot') < 4) {
      await lib.craft('gold_ingot', 4 - lib.count('gold_ingot'));
    }
    if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
      await lib.craft('golden_boots', 1);
      await lib.equipArmor();
      bot.chat('gamma: CRAFTED AND EQUIPPED GOLDEN BOOTS! 100% Piglin neutrality ACTIVE!');
      console.log('Golden boots equipped!');
    }
  } catch (e) {
    console.log('Craft error in Overworld:', e.message);
  }

  // Warp back to Nether with golden_boots equipped
  bot.chat('gamma: Golden boots equipped! Warping back to Nether bunker to place crafting table and barter!');
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -52.5, 0.5));
    await lib.door(294, 72, -54, false);
  } catch (e) {}

  try {
    await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -53.5, 0.4));
  } catch (e) {
    await lib.goToXZ(299.5, -53.5, { timeoutMs: 5000 });
  }

  const portalCenter = new Vec3(299.5, 73.0, -53.5);
  await bot.lookAt(portalCenter, true);
  bot.setControlState('forward', true);
  if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
  await sleep(350);
  bot.clearControlStates();

  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
    await sleep(250);
  }
}

// 5. In Nether: place crafting table in bunker at (41, 65, -6) if we have one
if (bot.game.dimension === 'the_nether') {
  console.log('Back in the_nether! Pos:', lib.fmt(bot.entity.position));
  await sleep(400);
  await bot.lookAt(new Vec3(44.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(800);
  bot.setControlState('forward', false);

  if (lib.count('crafting_table') > 0) {
    const tableSpot = new Vec3(41, 65, -6);
    const existing = bot.blockAt(tableSpot);
    if (existing && existing.name === 'air') {
      try {
        await lib.place('crafting_table', tableSpot.x, tableSpot.y, tableSpot.z);
        bot.chat('gamma: Placed Crafting Table inside Nether Base Camp bunker (41, 65, -6)!');
        console.log('Placed crafting table in Nether bunker!');
      } catch (e) {}
    }
  }

  // Ensure golden_boots equipped
  try { await lib.equipArmor(); } catch (e) {}
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
