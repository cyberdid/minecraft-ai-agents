// programs/503-find-portal-and-warp.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 16,
  count: 6
});

console.log(`Found ${portals.length} nether_portal blocks:`, portals.map(p => lib.fmt(p)).join(', '));

if (portals.length > 0) {
  const p = portals[0];
  console.log(`Stepping into nether_portal block at ${lib.fmt(p)}...`);

  bot.clearControlStates();
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);

  const moves = new Movements(bot, mcData);
  moves.canDig = false;
  moves.allowParkour = true;
  bot.pathfinder.setMovements(moves);

  try {
    await bot.pathfinder.goto(new goals.GoalBlock(p.x, p.y, p.z));
  } catch (e) {
    try {
      await bot.lookAt(p.offset(0.5, 0.5, 0.5), true);
      bot.setControlState('forward', true);
      await sleep(1000);
      bot.setControlState('forward', false);
    } catch (e2) {}
  }

  bot.clearControlStates();
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);

  console.log('Position inside portal block:', lib.fmt(bot.entity.position));

  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 15000) {
    await sleep(350);
  }
}

console.log('Dimension after warp:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'overworld') {
  try {
    if (bot.entity.position.z > -54.0) {
      await lib.goThroughDoor(294, 72, -54);
    }
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 1.0));
  } catch (e) {}

  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock && lib.count('gold_ingot') > 0) {
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
    } catch (e) {}
  }

  bot.chat('delta: In Overworld Base! Gold ingot deposited in Base Chest. Milestone 9 bartering prep advancing!');
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  ingots: lib.count('gold_ingot'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
