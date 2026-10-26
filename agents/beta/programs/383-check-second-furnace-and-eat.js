// programs/383-check-second-furnace-and-eat.js
console.log('=== Step: Check second furnace (295, 72, -57) and base chest for food/iron ===');

// 1. Check furnace at (295, 72, -57)
const fb2 = bot.blockAt(new Vec3(295, 72, -57));
if (fb2) {
  try {
    const f2 = await bot.openFurnace(fb2);
    const input = f2.inputItem();
    const fuel = f2.fuelItem();
    const output = f2.outputItem();
    console.log(`F2 (295, 72, -57): input=${input?.name}x${input?.count}, fuel=${fuel?.name}x${fuel?.count}, output=${output?.name}x${output?.count}, progress=${f2.progress}`);
    if (output && output.count > 0) {
      await f2.takeOutput();
      console.log(`Took ${output.name}x${output.count} from F2`);
    }
    // If there is raw iron or meat to smelt and fuel is needed:
    if (!fuel && input && lib.count('coal') > 0) {
      await f2.putFuel(mcData.itemsByName.coal.id, null, Math.min(lib.count('coal'), 4));
      console.log('Fueled F2 with coal.');
    }
    f2.close();
  } catch (e) {
    console.log('F2 error:', e.message);
  }
}

// 2. Check chest at (293, 72, -57)
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Chest contents:', items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    
    // Check for food
    const edibleNames = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken', 'bread', 'apple', 'baked_potato', 'beef', 'mutton', 'porkchop', 'chicken'];
    for (const en of edibleNames) {
      const it = items.find(i => i.name === en);
      if (it) {
        // take up to 4 cooked or raw meat
        const toTake = Math.min(it.count, 4);
        await chest.withdraw(it.type, null, toTake);
        console.log(`Withdrew ${it.name}x${toTake} from chest.`);
        break;
      }
    }

    // Check for iron ingots or raw iron
    const iron = items.find(i => i.name === 'iron_ingot');
    if (iron) {
      await chest.withdraw(iron.type, null, iron.count);
      console.log(`Withdrew iron_ingot x${iron.count} from chest.`);
    }
    const rawIron = items.find(i => i.name === 'raw_iron');
    if (rawIron) {
      await chest.withdraw(rawIron.type, null, rawIron.count);
      console.log(`Withdrew raw_iron x${rawIron.count} from chest.`);
    }

    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// 3. Eat if we have food and hunger < 20
const edibleItems = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken', 'bread', 'apple', 'baked_potato'];
for (const food of edibleItems) {
  while (lib.count(food) > 0 && bot.food < 20 && !isCancelled()) {
    console.log(`Eating ${food}...`);
    try {
      await bot.equip(mcData.itemsByName[food].id, 'hand');
      await bot.consume();
      console.log(`Ate ${food}. Food: ${bot.food}/20, Health: ${bot.health}/20`);
      await sleep(400);
    } catch (e) {
      console.log('Consume error:', e.message);
      break;
    }
  }
}

// 4. Report
console.log('Beta food:', bot.food, 'health:', bot.health, 'inv:', JSON.stringify(lib.inv()));
