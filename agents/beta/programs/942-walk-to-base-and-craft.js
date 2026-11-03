console.log('=== Program 942: Walk to Base & Craft Eyes of Ender ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
bot.chat('Beta: Walking to Overworld Base House (293, 72, -55)...');

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

// Staged waypoints to Base House
const stageWaypoints = [
  { x: 195, y: 63, z: -35 },
  { x: 230, y: 66, z: -42 },
  { x: 265, y: 70, z: -48 },
  { x: 294, y: 72, z: -52 } // Just outside door at (294, 72, -54)
];

for (let i = 0; i < stageWaypoints.length && !isCancelled(); i++) {
  const wp = stageWaypoints[i];
  console.log(`Advancing to Stage WP ${i + 1}/${stageWaypoints.length} at (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
  } catch (e) {
    console.log(`WP ${i + 1} pathfinder error:`, e.message);
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 12000 });
    } catch (e2) {
      console.log(`WP ${i + 1} goToXZ error:`, e2.message);
    }
  }
}

console.log('Arrived near Base Door! Pos:', lib.fmt(bot.entity.position));

// Enter through door into house
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Passed through door!');
} catch (e) {
  console.log('goThroughDoor notice:', e.message);
}

// Go to chest position inside house
try {
  await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 0.8));
} catch (e) {}

console.log('Inside Base! Current pos:', lib.fmt(bot.entity.position));

// Open Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  console.log('Opening Base Chest at (293, 72, -57)...');
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems();
    console.log('Base Chest contents:', items.map(it => `${it.name}x${it.count}`).join(', '));

    const powder = items.find(it => it.name === 'blaze_powder');
    if (powder) {
      console.log(`Withdrawing ${powder.count} blaze_powder...`);
      await chest.withdraw(powder.type, null, powder.count);
    }

    const food = items.find(it => ['cooked_mutton', 'cooked_beef', 'cooked_porkchop', 'bread'].includes(it.name));
    if (food) {
      console.log(`Withdrawing ${food.count} ${food.name}...`);
      await chest.withdraw(food.type, null, Math.min(16, food.count));
    }

    chest.close();
  } catch (err) {
    console.log('Chest error:', err.message);
  }
}

// Craft Eyes of Ender
const powderHeld = lib.count('blaze_powder');
const pearlsHeld = lib.count('ender_pearl');
console.log(`In inventory: ${powderHeld} blaze_powder, ${pearlsHeld} ender_pearl`);

const toCraft = Math.min(powderHeld, pearlsHeld);
if (toCraft > 0) {
  console.log(`Crafting ${toCraft} eye_of_ender...`);
  try {
    await lib.craft('eye_of_ender', toCraft);
    const eyes = lib.count('eye_of_ender');
    bot.chat(`Beta: CRAFTED ${eyes} EYES OF ENDER! Milestone 10 (Part 1) COMPLETE!`);
    console.log(`SUCCESS: ${eyes} eye_of_ender crafted!`);
  } catch (ce) {
    console.log('lib.craft eye_of_ender error:', ce.message);
  }
}

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  eyes: lib.count('eye_of_ender'),
  pearls: lib.count('ender_pearl'),
  powder: lib.count('blaze_powder'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
