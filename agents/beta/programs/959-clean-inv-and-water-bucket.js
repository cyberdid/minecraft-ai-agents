console.log('=== Program 959: Clean Inventory & Fill Water Bucket ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start position:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);

// 1. Open Base Chest and deposit clutter
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const clutterNames = [
      'bone_meal', 'soul_sand', 'soul_soil', 'granite', 'crying_obsidian',
      'wooden_pickaxe', 'blackstone', 'gravel', 'netherrack', 'bone',
      'gold_nugget', 'stone_sword', 'stone_pickaxe'
    ];

    for (const name of clutterNames) {
      const items = bot.inventory.items().filter(i => i.name === name);
      for (const it of items) {
        console.log(`Depositing ${it.count} ${it.name} into chest...`);
        try {
          await chest.deposit(it.type, null, it.count);
        } catch (de) {}
      }
    }

    // Check if chest has cooked food or iron ingots
    const cItems = chest.containerItems();
    const food = cItems.find(i => ['cooked_mutton', 'cooked_beef', 'cooked_porkchop', 'bread'].includes(i.name));
    if (food) {
      console.log(`Withdrawing ${food.count} ${food.name}...`);
      await chest.withdraw(food.type, null, Math.min(16, food.count));
    }

    // Check if blaze rods / powder already arrived in chest
    const rods = cItems.find(i => i.name === 'blaze_rod');
    if (rods) {
      console.log(`Withdrawing ${rods.count} blaze_rod from chest...`);
      await chest.withdraw(rods.type, null, rods.count);
    }
    const pow = cItems.find(i => i.name === 'blaze_powder');
    if (pow) {
      console.log(`Withdrawing ${pow.count} blaze_powder from chest...`);
      await chest.withdraw(pow.type, null, pow.count);
    }

    chest.close();
  } catch (err) {
    console.log('Chest error:', err.message);
  }
}

// 2. Fill bucket with water if empty bucket in inventory
const bucket = bot.inventory.items().find(i => i.name === 'bucket');
if (bucket && lib.count('water_bucket') === 0) {
  console.log('Found empty bucket! Seeking nearby water source...');
  try {
    await lib.fillBucket('water');
    console.log('Water bucket filled successfully!');
    bot.chat('Beta: Water bucket acquired!');
  } catch (we) {
    console.log('fillBucket notice:', we.message);
  }
}

// Ensure armor and weapon equipped
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Craft blaze powder and ender eyes if materials held
if (lib.count('blaze_rod') > 0) {
  try { await lib.craft('blaze_powder', lib.count('blaze_rod') * 2); } catch (e) {}
}
const bp = lib.count('blaze_powder');
const ep = lib.count('ender_pearl');
if (bp > 0 && ep > 0) {
  const n = Math.min(bp, ep);
  try {
    await lib.craft('ender_eye', n);
    bot.chat(`Beta: Crafted ${n} additional Eyes of Ender! Total held: ${lib.count('ender_eye')}`);
  } catch (e) {}
}

console.log('Beta cleaned inventory:', JSON.stringify(lib.inv()));
return {
  pos: bot.entity.position,
  ender_eyes: lib.count('ender_eye'),
  ender_pearls: lib.count('ender_pearl'),
  water_bucket: lib.count('water_bucket'),
  inv: lib.inv(),
  hp: bot.health,
  food: bot.food
};
