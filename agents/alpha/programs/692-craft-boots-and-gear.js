// programs/692-craft-boots-and-gear.js
console.log('=== Program 692: Consolidate Gold & Craft Boots ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// 1. Move right in front of Base Chest (293, 72, -57)
try {
  await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -56.5, 0.4));
} catch (e) {}

// 2. Open Base Chest
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    console.log('Base Chest items:');
    for (const item of chest.containerItems()) {
      if (item.name.includes('gold') || item.name.includes('powder') || item.name.includes('pearl')) {
        console.log(` - ${item.name} x ${item.count}`);
      }
    }
    const ing = chest.containerItems().find(i => i.name === 'gold_ingot');
    const nug = chest.containerItems().find(i => i.name === 'gold_nugget');
    if (ing) {
      console.log(`Withdrawing ${ing.count} gold ingots...`);
      await chest.withdraw(ing.type, null, ing.count);
    }
    if (nug) {
      console.log(`Withdrawing ${nug.count} gold nuggets...`);
      await chest.withdraw(nug.type, null, nug.count);
    }
    await chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

const ingots = lib.count('gold_ingot');
const nuggets = lib.count('gold_nugget');
console.log(`Alpha now holds: ${ingots} gold_ingot(s), ${nuggets} gold_nugget(s).`);

// 3. Craft ingots from nuggets
if (nuggets >= 9) {
  const craftable = Math.floor(nuggets / 9);
  console.log(`Crafting ${craftable} gold ingots...`);
  try {
    await lib.craft('gold_ingot', craftable);
    console.log(`Now holding ${lib.count('gold_ingot')} gold ingots!`);
  } catch (e) {
    console.log('Craft ingot note:', e.message);
  }
}

// 4. Craft golden_boots if 4+ ingots
if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
  console.log('Crafting golden_boots...');
  try {
    await lib.craft('golden_boots', 1);
    console.log('golden_boots crafted successfully!');
    await lib.equipArmor();
    bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped! 100% Piglin neutrality ACTIVE!');
  } catch (e) {
    console.log('Craft boots note:', e.message);
  }
} else {
  bot.chat(`alpha: Gold status: ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets.`);
}

// 5. Ensure shield in offhand
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
}

// 6. Check night time and sleep
const t = bot.time.timeOfDay;
if (t >= 12542 && t < 23460) {
  console.log('Night time! Sleeping in bed...');
  try {
    await lib.sleepInBed();
    console.log('Woke up! Time:', bot.time.timeOfDay);
    bot.chat('alpha: Slept until dawn! Ready for expedition.');
  } catch (e) {}
}

console.log('=== Program 692 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'Armor:', {
  head: bot.inventory.slots[5]?.name,
  chest: bot.inventory.slots[6]?.name,
  legs: bot.inventory.slots[7]?.name,
  feet: bot.inventory.slots[8]?.name,
  offhand: bot.inventory.slots[45]?.name
}, 'Inv:', lib.inv());
