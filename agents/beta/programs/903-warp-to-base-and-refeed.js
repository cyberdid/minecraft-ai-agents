console.log('=== Program 903: Warp to Overworld Base & Refeed ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Starting pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Move into the active portal at (40.5, 65.0, -7.0)
const portalTarget = new Vec3(40.5, 65.0, -7.0);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

console.log('Moving toward Nether Portal at (40.5, 65.0, -7.0)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(portalTarget.x, portalTarget.y, portalTarget.z, 0.5));
} catch (e) {
  console.log('Pathfinder error, falling back to direct walk:', e.message);
}

// Walk directly onto the portal block
await bot.lookAt(portalTarget, true);
bot.setControlState('forward', true);
await sleep(1500);
bot.setControlState('forward', false);

// Wait for dimension change to overworld
console.log('Waiting inside portal for warp to Overworld...');
const warpStart = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !checkCancelled()) {
  // If drifted out of portal, step back into (40.5, 65, -7)
  const cur = bot.entity.position;
  if (cur.distanceTo(portalTarget) > 1.2) {
    await bot.lookAt(portalTarget, true);
    bot.setControlState('forward', true);
    await sleep(400);
    bot.setControlState('forward', false);
  }
  await sleep(300);
}

console.log('Dimension after portal wait:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'overworld') {
  bot.chat('Beta: Warped to Overworld Base to refeed and gear up!');
  
  // Step out of Overworld portal
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);

  // Go to base chest at (293, 72, -57)
  try {
    if (bot.entity.position.z > -54.0) {
      await lib.goThroughDoor(294, 72, -54);
    }
  } catch (e) {}

  try {
    await lib.goTo(293, 72, -56, 1.5, { timeoutMs: 8000 });
  } catch (e) {}

  // Open base chest
  const chestBlock = bot.findBlock({
    matching: b => b && b.name.includes('chest'),
    maxDistance: 6
  });

  if (chestBlock) {
    console.log(`Found base chest at ${lib.fmt(chestBlock.position)}`);
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems();
    console.log(`Chest items (${items.length}):`);
    for (const it of items) {
      console.log(`  - ${it.name} x${it.count}`);
    }

    // Withdraw food
    const foodItem = items.find(i =>
      i.name.includes('cooked') ||
      i.name === 'bread' ||
      i.name === 'baked_potato' ||
      i.name === 'apple' ||
      i.name === 'golden_carrot'
    );

    if (foodItem) {
      const takeCount = Math.min(foodItem.count, 16);
      console.log(`Withdrawing ${foodItem.name} x${takeCount}...`);
      await chest.withdraw(foodItem.type, null, takeCount);
    }

    // Check for gold in chest
    const goldItem = items.find(i => i.name === 'gold_ingot' || i.name === 'gold_nugget');
    if (goldItem) {
      console.log(`Withdrawing ${goldItem.name} x${goldItem.count}...`);
      await chest.withdraw(goldItem.type, null, goldItem.count);
    }

    chest.close();
  } else {
    console.log('No chest found within 6 blocks.');
  }

  // Eat food if available
  const foodInInv = bot.inventory.items().find(i =>
    i.name.includes('cooked') ||
    i.name === 'bread' ||
    i.name === 'baked_potato' ||
    i.name === 'apple'
  );
  if (foodInInv) {
    console.log(`Eating ${foodInInv.name}...`);
    while (bot.food < 20 && !checkCancelled()) {
      const f = bot.inventory.items().find(i => i.name === foodInInv.name);
      if (!f) break;
      await bot.equip(f, 'hand');
      await bot.consume();
      console.log(`Ate 1 ${foodInInv.name}. Food: ${bot.food}/20, HP: ${bot.health}/20`);
      await sleep(200);
    }
  }
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
