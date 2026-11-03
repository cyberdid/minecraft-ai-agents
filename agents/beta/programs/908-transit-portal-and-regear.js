console.log('=== Program 908: Transit to Overworld Base & Regear ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Starting pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Follow path to Nether portal at (46.5, 66.0, 2.0)
const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

const portalTarget = new Vec3(46.5, 66.0, 2.0);
console.log('Navigating up staircase to portal at (46.5, 66.0, 2.0)...');

try {
  await bot.pathfinder.goto(new goals.GoalNear(portalTarget.x, portalTarget.y, portalTarget.z, 0.4));
} catch (e) {
  console.log('Pathfinder error:', e.message);
  // Manual step towards target
  await bot.lookAt(portalTarget, true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(1500);
  bot.clearControlStates();
}

console.log('Arrived at portal area:', lib.fmt(bot.entity.position));

// Step directly into the portal block
await bot.lookAt(portalTarget, true);
bot.setControlState('forward', true);
await sleep(800);
bot.clearControlStates();

// 2. Stand completely motionless inside portal for warp
console.log('Standing motionless inside portal for Overworld warp...');
const warpStart = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !checkCancelled()) {
  const cur = bot.entity.position;
  const b = bot.blockAt(cur);
  if (!b || b.name !== 'nether_portal') {
    // Nudge slightly into portal frame
    await bot.lookAt(portalTarget, true);
    bot.setControlState('forward', true);
    await sleep(250);
    bot.clearControlStates();
  }
  await sleep(400);
}

console.log('Dimension after warp wait:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'overworld') {
  bot.chat('Beta: Safely arrived at Overworld Base! Restocking team food & supplies.');

  // Step out of the portal
  bot.setControlState('forward', true);
  await sleep(1200);
  bot.clearControlStates();

  // Go through door into base if needed
  try {
    if (bot.entity.position.z > -54.0) {
      await lib.goThroughDoor(294, 72, -54);
    }
  } catch (e) {}

  try {
    await lib.goTo(293, 72, -56, 1.2, { timeoutMs: 6000 });
  } catch (e) {}

  // Open Base Chest at (293, 72, -57)
  const chestBlock = bot.findBlock({ matching: b => b && b.name.includes('chest'), maxDistance: 6 });
  if (chestBlock) {
    console.log(`Found Base Chest at ${lib.fmt(chestBlock.position)}`);
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems();
    console.log(`Chest items (${items.length}):`);
    for (const it of items) {
      console.log(`  - ${it.name} x${it.count}`);
    }

    // Withdraw food (up to 32 items to share with team)
    const foodItems = items.filter(i =>
      i.name.includes('cooked') ||
      i.name === 'bread' ||
      i.name === 'baked_potato' ||
      i.name === 'apple' ||
      i.name === 'golden_carrot'
    );
    for (const f of foodItems) {
      const take = Math.min(f.count, 32);
      console.log(`Withdrawing ${f.name} x${take}...`);
      await chest.withdraw(f.type, null, take);
      break;
    }

    // Withdraw any gold ingots
    const gold = items.find(i => i.name === 'gold_ingot');
    if (gold) {
      console.log(`Withdrawing ${gold.name} x${gold.count}...`);
      await chest.withdraw(gold.type, null, gold.count);
    }

    // Check blaze powder count
    const bp = items.find(i => i.name === 'blaze_powder');
    console.log(`Blaze powder in chest: ${bp ? bp.count : 0}`);

    chest.close();
  }

  // Consume food to restore hunger and heal
  let foodInInv = bot.inventory.items().find(i =>
    i.name.includes('cooked') ||
    i.name === 'bread' ||
    i.name === 'baked_potato' ||
    i.name === 'apple'
  );
  if (foodInInv) {
    console.log(`Consuming ${foodInInv.name}...`);
    while (bot.food < 20 && !checkCancelled()) {
      const f = bot.inventory.items().find(i => i.name === foodInInv.name);
      if (!f) break;
      await bot.equip(f, 'hand');
      await bot.consume();
      console.log(`Ate 1 ${foodInInv.name}. Food: ${bot.food}/20, HP: ${bot.health}/20`);
      await sleep(250);
    }
  }

  // Equip full iron armor, ensure golden boots kept in inventory
  try {
    await lib.equipArmor();
  } catch (e) {}

  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    await bot.equip(gb, 'feet');
    console.log('Golden boots secured on feet!');
  }
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
