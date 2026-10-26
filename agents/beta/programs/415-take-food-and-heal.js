// programs/415-take-food-and-heal.js
console.log('=== Step: Take food from base chest, eat, heal, and coordinate ===');
console.log('Current status: health=', bot.health, 'food=', bot.food);

// 1. Check chest (293, 72, -57)
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Chest items:', items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    
    // Take any edible food
    const edibles = items.filter(i => ['cooked_beef', 'cooked_chicken', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'baked_potato', 'rotten_flesh'].includes(i.name));
    for (const ed of edibles) {
      await chest.withdraw(ed.type, null, Math.min(ed.count, 4));
      console.log(`Withdrew ${ed.name}x${Math.min(ed.count, 4)} from chest!`);
    }

    // Check for iron ingots
    const ingots = items.find(i => i.name === 'iron_ingot');
    if (ingots) {
      await chest.withdraw(ingots.type, null, ingots.count);
      console.log(`Withdrew ${ingots.count} iron_ingot from chest!`);
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// 2. Eat food
const foodsToEat = ['cooked_beef', 'cooked_chicken', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'baked_potato', 'rotten_flesh'];
for (const f of foodsToEat) {
  while (lib.count(f) > 0 && bot.food < 20 && !isCancelled()) {
    try {
      await bot.equip(mcData.itemsByName[f].id, 'hand');
      await bot.consume();
      console.log(`Ate ${f}. Food now: ${bot.food}/20, Health: ${bot.health}/20`);
      await sleep(350);
    } catch (e) {
      console.log('Eat note:', e.message);
      break;
    }
  }
}

// 3. Craft boots or chestplate if iron ingots were in chest
const tableBlock = bot.blockAt(new Vec3(295, 72, -56));
if (tableBlock && lib.count('iron_ingot') >= 4) {
  let target = 'iron_boots';
  if (lib.count('iron_ingot') >= 8) target = 'iron_chestplate';
  console.log(`Crafting ${target}...`);
  const r = bot.recipesFor(mcData.itemsByName[target].id, null, 1, tableBlock)[0];
  if (r) {
    await bot.craft(r, 1, tableBlock);
    console.log(`Crafted ${target}!`);
    await lib.equipArmor();
  }
}

console.log(`Beta pos: ${lib.fmt(bot.entity.position)}, Food: ${bot.food}/20, Health: ${bot.health}/20`);
bot.chat(`beta: Morning! Wearing iron_helmet, iron_leggings, shield. Food: ${bot.food}/20, Health: ${bot.health}/20. Alpha, please share 2 cooked beef in chest!`);
