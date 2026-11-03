// programs/499-step-to-base-craft-golden-boots.js
console.log('=== GAMMA: STEP TO BASE, CRAFT GOLDEN BOOTS & RETURN ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Step up to Nether portal at (40, 65, -7)
if (bot.game.dimension === 'the_nether') {
  const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
  if (portalBlock) {
    console.log('Stepping into return portal at:', lib.fmt(portalBlock.position));
    try {
      await bot.pathfinder.goto(new goals.GoalNear(portalBlock.position.x, portalBlock.position.y, portalBlock.position.z, 0.4));
    } catch (e) {
      await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
      bot.setControlState('forward', true);
      if (bot.entity.position.y < portalBlock.position.y) bot.setControlState('jump', true);
      await sleep(1000);
      bot.clearControlStates();
    }

    const warpStart = Date.now();
    while (bot.game.dimension === 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
      await sleep(250);
    }
  }
}

console.log('Post-warp dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// 2. In Overworld Base: enter house and craft golden_boots
if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: In Overworld Base! Checking chest and crafting golden_boots...');

  // Enter house at (294, 72, -55)
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -55.5, 0.5));
    await lib.door(294, 72, -54, false);
  } catch (e) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
  }

  // Open Base Chest at (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openContainer(chestBlock);
      const ingots = chest.containerItems().find(i => i.name === 'gold_ingot');
      if (ingots) await chest.withdraw(ingots.type, null, ingots.count);
      const nuggets = chest.containerItems().find(i => i.name === 'gold_nugget');
      if (nuggets) await chest.withdraw(nuggets.type, null, nuggets.count);
      chest.close();
    } catch (e) {}
  }

  console.log(`Gold now held: ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets`);

  // Craft extra ingot if nuggets >= 9
  if (lib.count('gold_nugget') >= 9) {
    try { await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9)); } catch (e) {}
  }

  // Craft and equip golden_boots
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

  // Warp back to Nether wearing golden_boots!
  if (lib.count('golden_boots') > 0) {
    bot.chat('gamma: Returning to Nether wearing golden_boots to initiate Piglin bartering for Milestone 9!');
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
