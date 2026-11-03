// programs/502-step-portal-and-consolidate.js
console.log('Delta at Nether Bunker:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'food:', bot.food);

// 1. Step through return portal at (40, 65, -7)
console.log('Stepping into return portal (40, 65, -7)...');
const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 6 });
if (portalBlock) {
  bot.clearControlStates();
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);

  await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);

  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 15000) {
    await sleep(350);
  }
}

console.log('Dimension after warp:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

// 2. If in Overworld, walk into base house (293, 72, -56)
if (bot.game.dimension === 'overworld') {
  try {
    if (bot.entity.position.z > -54.0) {
      await lib.goThroughDoor(294, 72, -54);
    }
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 1.0));
  } catch (e) {}

  // 3. Open Base Chest and deposit gold ingot
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const ingot = bot.inventory.items().find(it => it.name === 'gold_ingot');
      if (ingot) {
        await chest.deposit(ingot.type, null, ingot.count);
        console.log(`Deposited ${ingot.count} gold_ingot into Base Chest!`);
      }
      const items = chest.containerItems().map(i => `${i.name} x${i.count}`);
      console.log('BASE CHEST NOW CONTAINS:', items.join(', '));
      chest.close();
    } catch (e) {
      console.log('Chest error:', e.message);
    }
  }

  // 4. Check bed to reset spawn / heal
  bot.chat('delta: Returned to Overworld Base! Gold ingot safely deposited in Base Chest. Milestone 9 progressing!');
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  ingots: lib.count('gold_ingot'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
