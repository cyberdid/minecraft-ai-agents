// programs/381-check-furnaces-and-chest.js
console.log('=== Step: Inspect furnaces and chest for iron and food ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Check all 3 furnaces
const furnaces = [
  ['F1', [295, 72, -55]],
  ['F2', [295, 72, -54]],
  ['F3', [295, 72, -56]]
];

for (const [name, pos] of furnaces) {
  const fb = bot.blockAt(new Vec3(...pos));
  if (fb) {
    try {
      const f = await bot.openFurnace(fb);
      const input = f.inputItem();
      const fuel = f.fuelItem();
      const output = f.outputItem();
      console.log(`${name}: input=${input?.name}x${input?.count}, fuel=${fuel?.name}x${fuel?.count}, output=${output?.name}x${output?.count}, progress=${f.progress}`);
      if (output && output.count > 0) {
        await f.takeOutput();
        console.log(`Took ${output.name}x${output.count} from ${name}`);
      }
      // If furnace is empty of fuel and has raw_iron, fuel it with coal!
      if (!fuel && input && input.name === 'raw_iron' && lib.count('coal') > 0) {
        await f.putFuel(mcData.itemsByName.coal.id, null, Math.min(lib.count('coal'), 4));
        console.log(`Fueled ${name} with coal.`);
      }
      f.close();
    } catch (e) {
      console.log(`${name} note:`, e.message);
    }
  }
}

// 2. Check chest
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems().map(i => `${i.name}x${i.count}`);
    console.log('Chest items:', items.join(', ') || 'empty');
    // Take any food
    const foods = ['cooked_chicken', 'cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'];
    for (const f of foods) {
      const it = chest.containerItems().find(i => i.name === f);
      if (it) {
        await chest.withdraw(it.type, null, Math.min(it.count, 4));
        console.log(`Withdrew ${f}x${it.count} from chest.`);
        break;
      }
    }
    // Take any iron ingots
    const ingots = chest.containerItems().find(i => i.name === 'iron_ingot');
    if (ingots) {
      await chest.withdraw(ingots.type, null, ingots.count);
      console.log(`Withdrew ${ingots.count} iron_ingot from chest.`);
    }
    chest.close();
  } catch (e) {
    console.log('Chest note:', e.message);
  }
}

// 3. Eat if we got food
const eatables = ['cooked_chicken', 'cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'];
for (const f of eatables) {
  while (lib.count(f) > 0 && bot.food < 20 && !isCancelled()) {
    console.log(`Eating ${f}...`);
    try {
      await bot.equip(mcData.itemsByName[f].id, 'hand');
      await bot.consume();
      console.log('Food now:', bot.food, 'health:', bot.health);
      await sleep(300);
    } catch (err) {
      console.log('Eat note:', err.message);
      break;
    }
  }
}

// 4. Report status
console.log('Beta iron_ingots in inventory:', lib.count('iron_ingot'));
console.log('Beta inventory now:', JSON.stringify(lib.inv()));
bot.chat(`beta: At base furnaces. Holding ${lib.count('iron_ingot')} iron ingots, food=${bot.food}/20, health=${bot.health}/20.`);
