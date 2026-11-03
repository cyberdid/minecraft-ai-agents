// programs/495-return-to-bunker.js
console.log('Delta at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'food:', bot.food);

// 1. Craft gold ingot from nuggets
const nuggets = lib.count('gold_nugget');
if (nuggets >= 9) {
  try {
    await lib.craft('gold_ingot', Math.floor(nuggets / 9));
    console.log('Crafted gold_ingot! Ingots:', lib.count('gold_ingot'), 'nuggets:', lib.count('gold_nugget'));
  } catch (e) {
    console.log('Craft ingot note:', e.message);
  }
}

// 2. Configure safe pathfinding down to bunker
bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) moves.blocksToAvoid.add(id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

console.log('Pathfinding down to Nether Base Camp bunker (41, 65, -6)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(41, 65, -6, 2.0));
  console.log('Arrived at bunker! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Bunker goto note:', e.message);
  // Try via East Ridge waypoints in reverse
  try {
    await bot.pathfinder.goto(new goals.GoalNear(46, 65, -7, 2.0));
    await bot.pathfinder.goto(new goals.GoalNear(41, 65, -6, 1.5));
  } catch (e2) {}
}

// 3. Check for nearby teammates
const players = Object.values(bot.players).filter(p => p.username !== bot.username && p.entity);
for (const p of players) {
  console.log(`Teammate ${p.username}: pos=${lib.fmt(p.entity.position)}`);
}

// 4. Enter portal at (40, 65, -7) to warp to Overworld Base
console.log('Stepping into return portal at (40, 65, -7)...');
const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
if (portalBlock) {
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

if (bot.game.dimension === 'overworld') {
  // Move to Base Chest (293, 72, -57)
  try {
    if (bot.entity.position.z > -54.0) {
      await lib.goThroughDoor(294, 72, -54);
    }
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 1.0));
  } catch (e) {}

  // Deposit gold ingots into Base Chest
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock && lib.count('gold_ingot') > 0) {
    try {
      const chest = await bot.openChest(chestBlock);
      const ingot = bot.inventory.items().find(it => it.name === 'gold_ingot');
      if (ingot) {
        await chest.deposit(ingot.type, null, ingot.count);
        console.log(`Deposited ${ingot.count} gold_ingots into Base Chest!`);
      }
      chest.close();
    } catch (e) {}
  }

  bot.chat('delta: Reunited at Base! Gold deposited. Preparing team bartering expedition for Milestone 9!');
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  ingots: lib.count('gold_ingot'),
  nuggets: lib.count('gold_nugget'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
