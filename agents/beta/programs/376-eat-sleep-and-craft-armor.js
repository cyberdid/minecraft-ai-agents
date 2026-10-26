// programs/376-eat-sleep-and-craft-armor.js
console.log('=== Base actions: eat food, sleep if night, collect iron, craft armor ===');

// 1. Check time and sleep if night
const t = lib.time();
console.log(`Time: ${t.timeOfDay}, canSleep: ${t.canSleep}, secondsUntilNight: ${t.secondsUntilNight}`);
if (t.canSleep) {
  console.log('Sleeping in bed...');
  try {
    const bed = bot.findBlock({ matching: b => b.name.endsWith('_bed'), maxDistance: 4 });
    if (bed) {
      await bot.sleep(bed);
      console.log('Sleeping peacefully in bed!');
      await sleep(4000);
    }
  } catch (err) {
    console.log('Sleep note:', err.message);
  }
}

// 2. Open chest and take food & iron
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    await lib.goTo(293, 72, -56, 1);
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems().map(i => `${i.name}x${i.count}`);
    console.log('Chest items:', items.join(', '));
    // Withdraw food
    const foods = ['cooked_chicken', 'cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'];
    for (const f of foods) {
      const it = chest.containerItems().find(i => i.name === f);
      if (it) {
        await chest.withdraw(it.type, null, Math.min(it.count, 4));
        console.log(`Withdrew ${f} from chest.`);
        break;
      }
    }
    // Withdraw any iron ingots or raw iron
    const ironItem = chest.containerItems().find(i => i.name === 'iron_ingot');
    if (ironItem) {
      await chest.withdraw(ironItem.type, null, ironItem.count);
      console.log(`Withdrew ${ironItem.count} iron_ingot from chest.`);
    }
    chest.close();
  } catch (e) {
    console.log('Chest note:', e.message);
  }
}

// 3. Eat food if in inventory
const eatables = ['cooked_chicken', 'cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'];
for (const f of eatables) {
  if (lib.count(f) > 0 && bot.food < 20) {
    console.log(`Eating ${f}...`);
    try {
      await bot.equip(mcData.itemsByName[f].id, 'hand');
      await bot.consume();
      console.log('Food level now:', bot.food, 'health:', bot.health);
    } catch (err) {
      console.log('Eat note:', err.message);
    }
  }
}

// 4. Check all 3 furnaces for smelted iron ingots
for (const [name, pos] of [['F1', [295, 72, -55]], ['F2', [295, 72, -54]], ['F3', [295, 72, -56]]]) {
  const fb = bot.blockAt(new Vec3(...pos));
  if (fb) {
    try {
      const f = await bot.openFurnace(fb);
      const output = f.outputItem();
      console.log(`${name}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, output=${output?.name}x${output?.count}`);
      if (output && output.count > 0) {
        await f.takeOutput();
        console.log(`Took ${output.name}x${output.count} from ${name}`);
      }
      f.close();
    } catch (err) {
      console.log(`${name} note:`, err.message);
    }
  }
}

console.log('Beta iron_ingots now:', lib.count('iron_ingot'));

// 5. Craft iron armor with available ingots
if (lib.count('iron_ingot') >= 8 && lib.count('iron_chestplate') === 0) {
  try {
    await lib.craft('iron_chestplate', 1);
    console.log('Crafted iron_chestplate!');
  } catch (e) {
    console.log('Chestplate note:', e.message);
  }
}

if (lib.count('iron_ingot') >= 7 && lib.count('iron_leggings') === 0) {
  try {
    await lib.craft('iron_leggings', 1);
    console.log('Crafted iron_leggings!');
  } catch (e) {
    console.log('Leggings note:', e.message);
  }
}

if (lib.count('iron_ingot') >= 5 && lib.count('iron_helmet') === 0) {
  try {
    await lib.craft('iron_helmet', 1);
    console.log('Crafted iron_helmet!');
  } catch (e) {
    console.log('Helmet note:', e.message);
  }
}

if (lib.count('iron_ingot') >= 4 && lib.count('iron_boots') === 0) {
  try {
    await lib.craft('iron_boots', 1);
    console.log('Crafted iron_boots!');
  } catch (e) {
    console.log('Boots note:', e.message);
  }
}

// 6. Equip armor
await lib.equipArmor();

console.log('Beta tools/gear:', JSON.stringify(lib.tools()));
console.log('Beta inventory:', JSON.stringify(lib.inv()));
bot.chat(`beta: Base status: Health ${bot.health}/20, Food ${bot.food}/20. Iron ingots: ${lib.count('iron_ingot')}. Gear: ${JSON.stringify(lib.tools())}`);
