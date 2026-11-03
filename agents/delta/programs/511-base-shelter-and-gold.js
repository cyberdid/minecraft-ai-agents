// programs/511-base-shelter-and-gold.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== OVERWORLD BASE SHELTER & GOLD POOLING ===');
console.log(`Delta pos: ${lib.fmt(bot.entity.position)}, Time: ${bot.time.timeOfDay}`);

// 1. Enter the base shelter through the door at (294, 72, -54)
if (bot.entity.position.z > -54.5) {
  console.log('Going through base door at (294, 72, -54)...');
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    console.log('Door navigation:', e.message);
    try { await lib.goTo(294, 72, -56, 1); } catch (e2) {}
  }
}

console.log('Inside base shelter. Current pos:', lib.fmt(bot.entity.position));

// 2. Check teammate players inside base
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} in dimension ${bot.game.dimension}`);
  }
}

// 3. Inspect Base Chest at (293, 72, -57) and deposit gold ingot so Gamma or team can craft golden boots
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const chestItems = chest.containerItems().map(i => `${i.name} x${i.count}`);
    console.log('Base Chest contents:', chestItems.join(', '));

    // Deposit gold_ingot and gold_nugget if held
    const ingot = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (ingot) {
      await chest.deposit(ingot.type, null, ingot.count);
      console.log(`Deposited ${ingot.count} gold_ingot into Base Chest!`);
      bot.chat(`delta: Deposited ${ingot.count} gold_ingot into Base Chest for golden_boots / bartering!`);
    }
    const nugget = bot.inventory.items().find(i => i.name === 'gold_nugget');
    if (nugget) {
      await chest.deposit(nugget.type, null, nugget.count);
      console.log(`Deposited ${nugget.count} gold_nugget into Base Chest!`);
    }

    const updatedItems = chest.containerItems().map(i => `${i.name} x${i.count}`);
    console.log('Updated Base Chest contents:', updatedItems.join(', '));
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// 4. Stand near Bed 2 at (293, 72, -56) and await night to sleep
console.log(`Current timeOfDay: ${bot.time.timeOfDay}. Night starts at tick 12542.`);
const bed2Block = bot.blockAt(new Vec3(293, 72, -56));
if (bed2Block) {
  console.log(`Bed 2 at (293, 72, -56): ${bed2Block.name}`);
}

// If night (12542-23460), sleep immediately!
if (bot.time.timeOfDay >= 12542 && bot.time.timeOfDay <= 23460) {
  console.log('Night is active! Attempting to sleep...');
  try {
    const bed = bot.findBlock({ matching: b => b && b.name.endsWith('_bed'), maxDistance: 4 });
    if (bed) {
      await bot.sleep(bed);
      console.log('Sleeping in bed...');
      await sleep(4000);
      await bot.wake();
      console.log('Woke up! Time:', bot.time.timeOfDay);
    }
  } catch (e) {
    console.log('Sleep error:', e.message);
  }
}

return {
  pos: bot.entity.position,
  timeOfDay: bot.time.timeOfDay,
  inv: lib.inv()
};
