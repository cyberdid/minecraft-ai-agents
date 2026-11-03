// programs/503-enter-house-craft-golden-boots.js
console.log('=== GAMMA: ENTER HOUSE, RETRIEVE GOLD & CRAFT BOOTS ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Step out of Nether portal into base yard (294, 72, -52.5)
bot.chat('gamma: At Overworld portal! Stepping into base house to craft golden_boots...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -52.5, 0.5));
} catch (e) {
  await lib.goToXZ(294, -52.5, { timeoutMs: 5000 });
}

// 2. Open base door (294, 72, -54) and enter house
try {
  await lib.door(294, 72, -54, true);
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -55.5, 0.5));
  await lib.door(294, 72, -54, false);
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

console.log('Inside base house! Pos:', lib.fmt(bot.entity.position));

// 3. Open Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    console.log('Base Chest contents:');
    for (const item of chest.containerItems()) {
      console.log(`- ${item.name} x${item.count}`);
    }

    // Withdraw all gold
    const ingots = chest.containerItems().find(i => i.name === 'gold_ingot');
    if (ingots) {
      await chest.withdraw(ingots.type, null, ingots.count);
      console.log(`Withdrew gold_ingot x${ingots.count}!`);
    }
    const nuggets = chest.containerItems().find(i => i.name === 'gold_nugget');
    if (nuggets) {
      await chest.withdraw(nuggets.type, null, nuggets.count);
      console.log(`Withdrew gold_nugget x${nuggets.count}!`);
    }

    // Deposit bulk blocks to clean inventory
    const bulkItems = ['netherrack', 'soul_sand', 'soul_soil'];
    for (const bName of bulkItems) {
      const invItem = bot.inventory.items().find(i => i.name === bName);
      if (invItem) {
        await chest.deposit(invItem.type, null, invItem.count);
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest interaction error:', e.message);
  }
}

const currentIngots = lib.count('gold_ingot');
const currentNuggets = lib.count('gold_nugget');
console.log(`Total gold available: ${currentIngots} ingots, ${currentNuggets} nuggets`);

// 4. Approach Crafting Table at (295, 72, -56)
const tableBlock = bot.blockAt(new Vec3(295, 72, -56));
if (tableBlock) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(295, 72, -56, 1.2));
  } catch (e) {}

  // Craft ingot from nuggets if needed
  if (lib.count('gold_nugget') >= 9) {
    try {
      const extra = Math.floor(lib.count('gold_nugget') / 9);
      await lib.craft('gold_ingot', extra);
      console.log(`Crafted ${extra} gold ingots from nuggets!`);
    } catch (e) {
      console.log('Craft ingot error:', e.message);
    }
  }

  // Craft golden_boots!
  if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
    try {
      await lib.craft('golden_boots', 1);
      await lib.equipArmor();
      bot.chat('gamma: CRAFTED AND EQUIPPED GOLDEN BOOTS! 100% Piglin neutrality ACTIVE!');
      console.log('*** GOLDEN BOOTS EQUIPPED! PIGLIN NEUTRALITY ACTIVE! ***');
    } catch (e) {
      console.log('Craft boots error:', e.message);
    }
  }

  // Craft any remaining nuggets into ingots
  if (lib.count('gold_nugget') >= 9) {
    try {
      await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
    } catch (e) {}
  }
}

// 5. Ensure armor & weapon equipped
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Sleep if night time
if (bot.time.timeOfDay >= 12542 || bot.time.timeOfDay <= 500) {
  try {
    await lib.sleep();
    bot.chat('gamma: Slept in bed! Night skipped!');
  } catch (e) {}
}

const finalBoots = lib.count('golden_boots');
const finalIngots = lib.count('gold_ingot');
const finalPearls = lib.count('ender_pearl');

bot.chat(`gamma: Base gear complete. Golden Boots: ${finalBoots}, Barter Ingots: ${finalIngots}, Ender Pearls: ${finalPearls}/12, HP: ${bot.health.toFixed(1)}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  boots: finalBoots,
  ingots: finalIngots,
  pearls: finalPearls,
  inv: lib.inv()
};
