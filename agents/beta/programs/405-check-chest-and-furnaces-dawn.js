// programs/405-check-chest-and-furnaces-dawn.js
console.log('=== Step: Dawn inspection of chest and furnaces ===');

const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Chest items:', items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    
    // Check for iron ingots
    const ingots = items.find(i => i.name === 'iron_ingot');
    if (ingots) {
      console.log(`Found ${ingots.count} iron_ingot in chest!`);
      // If we can craft boots (4) or leggings (7) or chestplate (8)
      await chest.withdraw(ingots.type, null, ingots.count);
      console.log(`Withdrew ${ingots.count} iron_ingot.`);
    }

    // Check for food
    const foods = items.filter(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'].includes(i.name));
    for (const fd of foods) {
      await chest.withdraw(fd.type, null, Math.min(fd.count, 4));
      console.log(`Withdrew ${fd.name}x${Math.min(fd.count, 4)} from chest.`);
      break;
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// Check F1 and F2
for (const [name, pos] of [['F1', [295, 72, -55]], ['F2', [295, 72, -57]]]) {
  const fb = bot.blockAt(new Vec3(...pos));
  if (fb) {
    try {
      const f = await bot.openFurnace(fb);
      console.log(`${name}: in=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, out=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      if (f.outputItem() && f.outputItem().count > 0) {
        await f.takeOutput();
        console.log(`Took ${f.outputItem().name}x${f.outputItem().count} from ${name}`);
      }
      f.close();
    } catch (e) {}
  }
}

// Eat if we got food
const eatables = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'];
for (const f of eatables) {
  while (lib.count(f) > 0 && bot.food < 20 && !isCancelled()) {
    try {
      await bot.equip(mcData.itemsByName[f].id, 'hand');
      await bot.consume();
      console.log(`Ate ${f}. Food: ${bot.food}/20, Health: ${bot.health}/20`);
      await sleep(300);
    } catch (e) { break; }
  }
}

// Craft armor if we have >= 4 ingots
const tableBlock = bot.blockAt(new Vec3(295, 72, -56));
if (tableBlock && lib.count('iron_ingot') >= 4) {
  let target = 'iron_boots';
  if (lib.count('iron_ingot') >= 8) target = 'iron_chestplate';
  else if (lib.count('iron_ingot') >= 7) target = 'iron_leggings';
  
  console.log(`Attempting to craft ${target}...`);
  const r = bot.recipesFor(mcData.itemsByName[target].id, null, 1, tableBlock)[0];
  if (r) {
    await bot.craft(r, 1, tableBlock);
    console.log(`Crafted ${target}!`);
    await lib.equipArmor();
  }
}

console.log('Beta status: food =', bot.food, 'health =', bot.health, 'gear:');
for (const s of [5, 6, 7, 8, 45]) {
  const item = bot.inventory.slots[s];
  if (item) console.log(`  slot ${s}: ${item.name}`);
}

bot.chat(`beta: Morning! Wearing helmet=${bot.inventory.slots[5]?.name}, boots=${bot.inventory.slots[8]?.name}, offhand=${bot.inventory.slots[45]?.name}. Health: ${bot.health}/20, Food: ${bot.food}/20.`);
