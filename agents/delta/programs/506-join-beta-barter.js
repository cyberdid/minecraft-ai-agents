// programs/506-join-beta-barter.js
console.log('Delta preparing barter run at:', lib.fmt(bot.entity.position));

// 1. Withdraw 1 gold ingot from Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const ingot = chest.containerItems().find(i => i.name === 'gold_ingot');
    if (ingot) {
      await chest.withdraw(ingot.type, null, ingot.count);
      console.log(`Withdrew ${ingot.count} gold_ingot from Base Chest!`);
    }
    chest.close();
  } catch (e) {
    console.log('Chest withdraw error:', e.message);
  }
}

console.log('Gold ingots in Delta inv:', lib.count('gold_ingot'));

// 2. Step outside base door to portal (299.5, 73, -54)
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

// Equip shield in offhand and stone sword
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

// 3. Step into Nether portal using GoalBlock(299, 73, -54)
console.log('Stepping into Nether Portal (299, 73, -54)...');
bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

try {
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
} catch (e) {
  try {
    await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
    await sleep(800);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  } catch (e2) {}
}

bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

console.log('Position inside portal block:', lib.fmt(bot.entity.position));

// Wait for warp to the_nether
const warpStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 15000) {
  await sleep(350);
}

console.log('Dimension after warp:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  globalThis.configureFireAvoidance();
  bot.chat(`delta: In Nether holding ${lib.count('gold_ingot')} gold ingots! Marching to East Ridge to join Beta for Piglin bartering!`);

  // Step out of portal into safe bunker
  await sleep(400);
  await bot.lookAt(new Vec3(41.0, 65.0, -6.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);

  // Advance along East Ridge waypoints towards Beta
  const RIDGE_WPS = [
    { x: 46, y: 65, z: -7 },
    { x: 54, y: 65, z: -7 },
    { x: 63, y: 64, z: -7 },
    { x: 63, y: 65, z: -20 },
    { x: 63, y: 66, z: -35 }
  ];

  for (let i = 0; i < RIDGE_WPS.length; i++) {
    const wp = RIDGE_WPS[i];
    console.log(`Advancing to Ridge WP ${i + 1}/${RIDGE_WPS.length} (${wp.x}, ${wp.y}, ${wp.z})...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
      console.log(`Reached WP ${i + 1}! Pos: ${lib.fmt(bot.entity.position)}`);
    } catch (e) {
      console.log(`WP ${i + 1} note:`, e.message);
    }
  }

  // Check for nearby teammates
  const players = Object.values(bot.players).filter(p => p.username !== bot.username && p.entity);
  for (const p of players) {
    console.log(`Teammate ${p.username}: pos=${lib.fmt(p.entity.position)}`);
  }

  // Check for Piglins nearby
  const piglins = Object.values(bot.entities).filter(e =>
    e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 16
  );
  console.log(`Found ${piglins.length} Piglins nearby on ridge.`);

  // If Beta is nearby, toss gold ingot to Beta!
  const betaPlayer = Object.values(bot.players).find(p => p.username === 'beta' && p.entity);
  if (betaPlayer && lib.count('gold_ingot') > 0) {
    const bPos = betaPlayer.entity.position;
    if (bot.entity.position.distanceTo(bPos) <= 6.0) {
      console.log(`Tossing gold_ingot to Beta (wearing golden_boots) at ${lib.fmt(bPos)}...`);
      await bot.lookAt(bPos.offset(0, 1.2, 0), true);
      const ingot = bot.inventory.items().find(it => it.name === 'gold_ingot');
      if (ingot) {
        await bot.toss(ingot.type, null, ingot.count);
        bot.chat('delta: Tossed gold ingot to Beta for Piglin bartering!');
      }
    }
  }

  // Vacuum any dropped items (bartered ender pearls!)
  try { await lib.pickup(4.0); } catch (e) {}

  const pearls = lib.count('ender_pearl');
  bot.chat(`delta: Ridge bartering patrol complete. Delta holds ${pearls}/12 Ender Pearls.`);
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  pearls: lib.count('ender_pearl'),
  ingots: lib.count('gold_ingot'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
