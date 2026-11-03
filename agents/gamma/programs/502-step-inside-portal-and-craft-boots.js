// programs/502-step-inside-portal-and-craft-boots.js
console.log('=== GAMMA: STEP INTO PORTAL (46.5, 66, 2.5) & CRAFT BOOTS ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Step into nether_portal block at (46.5, 66.0, 2.5)
if (bot.game.dimension === 'the_nether') {
  bot.chat('gamma: Stepping 1m forward into Nether portal block at (46.5, 66, 2.5)...');
  const target = new Vec3(46.5, 66.0, 2.5);
  await bot.lookAt(target, true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.setControlState('forward', false);
  bot.clearControlStates();
  bot.pathfinder.stop();

  console.log('Standing completely still inside portal at:', lib.fmt(bot.entity.position));
  const warpStart = Date.now();
  while (bot.game.dimension === 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
    await sleep(250);
  }
}

console.log('Dimension after warp:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// 2. In Overworld Base: enter house and craft golden_boots
if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: In Overworld Base! Retrieving gold ingot from Base Chest for golden_boots...');

  // Enter house at (294, 72, -55)
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -55.5, 0.5));
    await lib.door(294, 72, -54, false);
  } catch (e) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
  }

  // Open Base Chest at (293, 72, -57) and withdraw gold ingot & nuggets
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openContainer(chestBlock);
      const ingots = chest.containerItems().find(i => i.name === 'gold_ingot');
      if (ingots) await chest.withdraw(ingots.type, null, ingots.count);
      const nuggets = chest.containerItems().find(i => i.name === 'gold_nugget');
      if (nuggets) await chest.withdraw(nuggets.type, null, nuggets.count);
      chest.close();
      console.log('Withdrew gold from Base Chest!');
    } catch (e) {
      console.log('Chest error:', e.message);
    }
  }

  console.log(`Current gold: ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets`);

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

  // Return to Nether wearing golden_boots!
  if (lib.count('golden_boots') > 0) {
    bot.chat('gamma: Returning to Nether wearing golden_boots to join Beta in Piglin bartering for Milestone 9!');
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
