// programs/518-fuel-furnace-and-craft-shield.js
console.log('=== Program 518: Fuel Furnace, Collect Logs & Craft Shield ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

bot.pathfinder.stop();
await sleep(100);

// 1. Get saplings from chest at (293, 72, -57) for furnace fuel
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    for (const item of chest.containerItems()) {
      if (item.name.endsWith('_sapling')) {
        console.log(`Withdrawing ${item.name} x${item.count}...`);
        await chest.withdraw(item.type, null, item.count);
      }
    }
    await chest.close();
  } catch (err) {
    console.log('Chest withdraw note:', err.message);
  }
}
console.log('Inv after chest:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));

// 2. Put saplings into furnace at (295, 72, -55) to start smelting
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnaceBlock) {
  try {
    const furnace = await bot.openFurnace(furnaceBlock);
    const saplings = bot.inventory.items().filter(i => i.name.endsWith('_sapling'));
    for (const s of saplings) {
      console.log(`Fueling furnace with ${s.name} x${s.count}...`);
      await furnace.putFuel(s.type, null, s.count);
    }
    await furnace.close();
    console.log('Furnace fueled! Smelting in progress...');
  } catch (err) {
    console.log('Furnace fuel note:', err.message);
  }
}

// 3. Collect 3 logs using tested lib.collect
console.log('Collecting 3 logs using lib.collect...');
try {
  await lib.collect('*_log', 3);
  console.log('Logs collected! Logs count:', lib.count('*_log'));
} catch (err) {
  console.log('lib.collect note:', err.message);
}

// 4. Return to base interior if outside
console.log('Returning to base interior...');
try {
  await lib.goTo(294, 72, -52, 1);
  await passDoorIn();
} catch (err) {
  console.log('Return to base note:', err.message);
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -56, 1));
}

// 5. Craft planks
if (lib.count('*_log') > 0) {
  const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
  if (logItem) {
    await lib.craft('birch_planks', logItem.count * 4);
    console.log('Planks in inv:', lib.count('*_planks'));
  }
}

// 6. Check furnace output for iron ingot
if (furnaceBlock) {
  try {
    const furnace = await bot.openFurnace(furnaceBlock);
    console.log('Checking furnace output...');
    for (let i = 0; i < 15; i++) {
      if (furnace.outputItem() && furnace.outputItem().count >= 1) {
        console.log(`Taking ${furnace.outputItem().name} x${furnace.outputItem().count} from furnace!`);
        await furnace.takeOutput();
        break;
      }
      await sleep(1000);
    }
    await furnace.close();
  } catch (err) {
    console.log('Furnace check note:', err.message);
  }
}
console.log('Iron ingots in inv:', lib.count('iron_ingot'));

// 7. Craft Shield and equip!
if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting shield...');
  await lib.craft('shield', 1);
  console.log('SHIELD CRAFTED!');
  await lib.equipArmor();
  console.log('Shield equipped in offhand!');
} else {
  console.log(`Ingredients: ingots=${lib.count('iron_ingot')}, planks=${lib.count('*_planks')}`);
}

console.log('=== Final Status ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));
