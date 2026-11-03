console.log('=== Program 905: Step Into Portal & Regear at Base ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Starting pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Center of portal block at (40, 65, -7) is (40.5, 65.0, -6.5)
const portalCenter = new Vec3(40.5, 65.0, -6.5);

// Move directly onto portalCenter
await bot.lookAt(portalCenter, true);
bot.setControlState('forward', true);
if (bot.entity.position.y < 64.9) {
  bot.setControlState('jump', true);
}
await sleep(1000);
bot.clearControlStates();

console.log('Stepped to:', lib.fmt(bot.entity.position), 'block at feet:', bot.blockAt(bot.entity.position)?.name);

// Stand completely motionless for warp
console.log('Standing motionless inside portal for warp to Overworld...');
const warpStart = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 20000 && !checkCancelled()) {
  const b = bot.blockAt(bot.entity.position);
  if (b && b.name !== 'nether_portal') {
    // If not inside nether_portal, adjust position slightly towards portalCenter
    await bot.lookAt(portalCenter, true);
    bot.setControlState('forward', true);
    await sleep(200);
    bot.clearControlStates();
  }
  await sleep(400);
}

console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'overworld') {
  bot.chat('Beta: Arrived at Overworld Base! Refeeding and gearing up for Milestone 9!');
  
  // Step out of the portal
  bot.setControlState('forward', true);
  await sleep(1200);
  bot.clearControlStates();

  // Head into base shelter
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

    // Withdraw food
    const foodItem = items.find(i =>
      i.name.includes('cooked') ||
      i.name === 'bread' ||
      i.name === 'baked_potato' ||
      i.name === 'apple' ||
      i.name === 'golden_carrot'
    );
    if (foodItem) {
      const cnt = Math.min(foodItem.count, 16);
      console.log(`Withdrawing ${foodItem.name} x${cnt}...`);
      await chest.withdraw(foodItem.type, null, cnt);
    }

    // Check if there are gold ingots or nuggets
    const gold = items.find(i => i.name === 'gold_ingot');
    if (gold) {
      console.log(`Withdrawing ${gold.name} x${gold.count}...`);
      await chest.withdraw(gold.type, null, gold.count);
    }

    chest.close();
  }

  // Eat food
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

  // Ensure armor is equipped
  try {
    await lib.equipArmor();
  } catch (e) {}
  
  // Re-verify golden boots on slot 8
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    await bot.equip(gb, 'feet');
    console.log('Golden boots locked on feet!');
  }
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
