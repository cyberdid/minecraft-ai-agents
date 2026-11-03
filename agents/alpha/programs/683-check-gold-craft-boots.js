// programs/683-check-gold-craft-boots.js
console.log('=== Program 683: Check Gold & Craft Golden Boots ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Step into base house
if (bot.entity.position.distanceTo(new Vec3(293, 72, -55)) > 2.5) {
  try {
    await lib.goTo(294, 72, -52, 1.5, { timeoutMs: 8000 });
  } catch (e) {}
}
if (bot.entity.position.z > -54.0) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
}

// 2. Open base chest (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57)) || bot.findBlock({ matching: b => b && b.name === 'chest', maxDistance: 8 });
let chestIngots = 0;
let chestNuggets = 0;

if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    console.log('Base Chest items:');
    for (const item of chest.containerItems()) {
      console.log(` - ${item.name} x ${item.count}`);
      if (item.name === 'gold_ingot') chestIngots += item.count;
      if (item.name === 'gold_nugget') chestNuggets += item.count;
    }
    
    // Withdraw all gold
    if (chestIngots > 0) {
      const it = chest.containerItems().find(i => i.name === 'gold_ingot');
      if (it) await chest.withdraw(it.type, null, it.count);
    }
    if (chestNuggets > 0) {
      const it = chest.containerItems().find(i => i.name === 'gold_nugget');
      if (it) await chest.withdraw(it.type, null, it.count);
    }
    await chest.close();
  } catch (e) {
    console.log('Error opening chest:', e.message);
  }
}

const totalIngots = lib.count('gold_ingot');
const totalNuggets = lib.count('gold_nugget');
console.log(`Alpha now holds: ${totalIngots} gold_ingots, ${totalNuggets} gold_nuggets.`);

// 3. Craft ingots from nuggets
if (totalNuggets >= 9) {
  const craftable = Math.floor(totalNuggets / 9);
  console.log(`Crafting ${craftable} gold_ingot(s)...`);
  try {
    await lib.craft('gold_ingot', craftable);
    console.log(`Now holding ${lib.count('gold_ingot')} gold_ingots.`);
  } catch (e) {
    console.log('Craft ingot note:', e.message);
  }
}

// 4. If we have 4+ ingots, craft golden_boots!
if (lib.count('gold_ingot') >= 4) {
  console.log('Crafting golden_boots for Piglin neutrality...');
  try {
    await lib.craft('golden_boots', 1);
    console.log('Successfully crafted golden_boots!');
    await lib.equipArmor();
    bot.chat('alpha: [Suit Up] golden_boots crafted and equipped! Piglins are 100% NEUTRAL!');
  } catch (e) {
    console.log('Craft boots note:', e.message);
  }
} else {
  console.log(`Need ${4 - lib.count('gold_ingot')} more gold_ingot(s) to craft golden_boots.`);
  bot.chat(`alpha: Gold status: ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets. Need 4 ingots for golden_boots.`);
}

// 5. If night approaching / night time, sleep in bed to skip night
const t = bot.time.timeOfDay;
if (t >= 12542 && t < 23460) {
  console.log('Night time! Sleeping in bed (294, 72, -55)...');
  try {
    await lib.sleepInBed();
    console.log('Woke up at dawn! Time:', bot.time.timeOfDay, 'HP:', bot.health, 'Food:', bot.food);
  } catch (e) {
    console.log('sleepInBed note:', e.message);
  }
}

console.log('=== Program 683 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'Armor:', bot.inventory.slots.slice(5, 9).map(s => s?.name), 'Inv:', lib.inv());
