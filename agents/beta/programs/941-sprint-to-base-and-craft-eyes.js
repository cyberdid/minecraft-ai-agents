console.log('=== Program 941: Sprint to Base & Craft Eyes of Ender ===');
globalThis.isProgramCancelled = isCancelled;

console.log('Beta start position:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food, 'Pearls:', lib.count('ender_pearl'));

bot.chat('Beta: Respawned in Overworld at 20/20 HP with 25 Ender Pearls! Sprinting to Base (293, 72, -55)...');

// 1. Move to Base House in Overworld
const baseDoor = new Vec3(294, 72, -54);
const baseInside = new Vec3(293, 72, -56);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

console.log(`Navigating to Base Door at ${lib.fmt(baseDoor)}...`);
try {
  await bot.pathfinder.goto(new goals.GoalNear(baseDoor.x, baseDoor.y, baseDoor.z, 2.0));
} catch (e) {
  console.log('Direct goto door error, trying lib.goToXZ:', e.message);
  try {
    await lib.goToXZ(baseDoor.x, baseDoor.z, { timeoutMs: 25000 });
  } catch (e2) {
    console.log('lib.goToXZ error:', e2.message);
  }
}

console.log('Arrived near Base Door! Current pos:', lib.fmt(bot.entity.position));

// Enter through door
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('goThroughDoor error (might already be inside or door open):', e.message);
}

// Reach interior position
try {
  await bot.pathfinder.goto(new goals.GoalNear(baseInside.x, baseInside.y, baseInside.z, 1.0));
} catch (e) {}

console.log('Inside Base! Position:', lib.fmt(bot.entity.position));

// 2. Open Base Chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);

if (chestBlock) {
  console.log(`Opening Base Chest at ${lib.fmt(chestPos)}...`);
  try {
    const chest = await bot.openChest(chestBlock);
    const chestItems = chest.containerItems();
    console.log('Chest contains:', chestItems.map(i => `${i.name}x${i.count}`).join(', '));

    const powder = chestItems.find(i => i.name === 'blaze_powder');
    if (powder) {
      console.log(`Withdrawing ${powder.count} blaze_powder...`);
      await chest.withdraw(powder.type, null, powder.count);
    } else {
      console.log('No blaze_powder in chest? Check if already withdrawn or in inventory.');
    }

    // Grab cooked food
    const food = chestItems.find(i => ['cooked_mutton', 'cooked_beef', 'cooked_porkchop', 'bread'].includes(i.name));
    if (food) {
      console.log(`Withdrawing ${food.count} ${food.name}...`);
      await chest.withdraw(food.type, null, Math.min(16, food.count));
    }

    chest.close();
  } catch (err) {
    console.log('Chest interaction error:', err.message);
  }
} else {
  console.log('No block at chest position:', lib.fmt(chestPos));
}

// 3. Craft Eyes of Ender
const powderHeld = lib.count('blaze_powder');
const pearlsHeld = lib.count('ender_pearl');
console.log(`Resources in hand: ${powderHeld} blaze_powder, ${pearlsHeld} ender_pearl`);

const eyesToCraft = Math.min(powderHeld, pearlsHeld);
if (eyesToCraft > 0) {
  console.log(`Crafting ${eyesToCraft} eye_of_ender...`);
  try {
    await lib.craft('eye_of_ender', eyesToCraft);
    const totalEyes = lib.count('eye_of_ender');
    bot.chat(`Beta: CRAFTED ${totalEyes} EYES OF ENDER! Milestone 10 in progress!`);
    console.log(`SUCCESS! Current eye_of_ender count: ${totalEyes}`);
  } catch (craftErr) {
    console.log('Craft error:', craftErr.message);
  }
}

console.log('Final inventory:', JSON.stringify(lib.inv()));
return {
  pos: bot.entity.position,
  dimension: bot.game.dimension,
  eyes: lib.count('eye_of_ender'),
  pearls: lib.count('ender_pearl'),
  powder: lib.count('blaze_powder'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
