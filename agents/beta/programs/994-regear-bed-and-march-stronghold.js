console.log('=== Program 994: Regear Bed & March to Stronghold (2240, 1456) ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Time:', bot.time.timeOfDay);
console.log('Holding:', lib.count('ender_eye'), 'Eyes of Ender!');

// 1. Announce exact Stronghold coordinates to team
bot.chat('TEAM: Stronghold confirmed at (2240, y, 1456)! Grab beds and march together along 37.8° SE heading!');

// 2. Return to Base House to grab bed and food
console.log('Returning to Base House (293, 72, -55) to grab bed...');
try {
  await lib.goTo(294, 72, -53, 1.5, { timeoutMs: 12000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Return error:', e.message);
}

// Check Base Chest for bed and food
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems();

    // Check for bed in chest
    const bed = items.find(i => i.name.includes('bed'));
    if (bed && lib.count('*_bed') === 0) {
      console.log(`Withdrawing ${bed.name} from chest...`);
      await chest.withdraw(bed.type, null, 1);
    }

    // Check for food
    const food = items.find(i => i.name.includes('cooked') || i.name === 'bread');
    if (food) {
      console.log(`Withdrawing ${food.name} x${Math.min(food.count, 16)} from chest...`);
      await chest.withdraw(food.type, null, Math.min(food.count, 16));
    }

    // Deposit junk
    const junk = ['gold_nugget', 'bone', 'crying_obsidian', 'blackstone', 'wooden_pickaxe', 'stone_sword', 'andesite', 'blaze_powder'];
    for (const j of junk) {
      const it = bot.inventory.items().find(i => i.name === j);
      if (it) try { await chest.deposit(it.type, null, it.count); } catch (e) {}
    }

    chest.close();
  } catch (e) {}
}

// Check if we can craft a travel bed from wool and planks
if (lib.count('*_bed') === 0) {
  if (lib.count('*_wool') >= 3 && lib.count('*_planks') >= 3) {
    try {
      await lib.craft('white_bed', 1);
      console.log('Crafted travel bed!');
    } catch (e) {}
  }
}

console.log('Bed count in inventory:', lib.count('*_bed'));
console.log('Eyes of Ender in inventory:', lib.count('ender_eye'));

// Exit base house
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

// Advance 150m along 37.8° South-East heading towards (2240, 70, 1456)
// From (294, 72, -54):
// dx = +150 * 0.791 = +118 -> x = 412
// dz = +150 * 0.612 = +92 -> z = +38
const stage1 = new Vec3(412.0, 70.0, 38.0);
console.log(`Advancing Stage 1 towards Stronghold: ${lib.fmt(stage1)}...`);

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

try {
  await bot.pathfinder.goto(new goals.GoalNear(stage1.x, stage1.y, stage1.z, 5.0));
} catch (e) {
  console.log('Stage 1 pathfinder info:', e.message);
  try {
    await lib.goToXZ(stage1.x, stage1.z, { timeoutMs: 25000 });
  } catch (e2) {}
}

// Distance to Stronghold (2240, 70, 1456)
const distRemaining = bot.entity.position.distanceTo(new Vec3(2240, 70, 1456));
console.log(`Current pos: ${lib.fmt(bot.entity.position)}, Distance to Stronghold: ${distRemaining.toFixed(1)}m`);

return {
  pos: bot.entity.position,
  distRemaining,
  eyes: lib.count('ender_eye'),
  bed: lib.count('*_bed'),
  hp: bot.health,
  food: bot.food
};
