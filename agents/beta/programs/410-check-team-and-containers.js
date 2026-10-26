// programs/410-check-team-and-containers.js
console.log('=== Step: Inspect base containers & check team positions ===');
console.log('Beta pos:', lib.fmt(bot.entity.position));

// 1. Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const pos = p.entity.position;
    const dist = bot.entity.position.distanceTo(pos).toFixed(1);
    console.log(`Player ${name}: pos=${lib.fmt(pos)}, dist=${dist}m, held=${p.entity.heldItem?.name}`);
  } else {
    console.log(`Player ${name}: offline / not in range`);
  }
}

// 2. Check chest (293, 72, -57)
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Chest items:', items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    
    // Check for iron ingots
    const ingots = items.find(i => i.name === 'iron_ingot');
    if (ingots) {
      await chest.withdraw(ingots.type, null, ingots.count);
      console.log(`Withdrew ${ingots.count} iron_ingot from chest!`);
    }

    // Check for food
    const foods = items.filter(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'cooked_chicken'].includes(i.name));
    for (const fd of foods) {
      await chest.withdraw(fd.type, null, Math.min(fd.count, 4));
      console.log(`Withdrew ${fd.name}x${Math.min(fd.count, 4)} from chest!`);
      break;
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// 3. Check furnaces F1 and F2
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

// 4. Eat if food obtained
const edibles = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'cooked_chicken'];
for (const fd of edibles) {
  while (lib.count(fd) > 0 && bot.food < 20 && !isCancelled()) {
    try {
      await bot.equip(mcData.itemsByName[fd].id, 'hand');
      await bot.consume();
      console.log(`Ate ${fd}. Food: ${bot.food}/20, Health: ${bot.health}/20`);
      await sleep(300);
    } catch (e) { break; }
  }
}

// 5. Craft armor piece if 4+ ingots
const tableBlock = bot.blockAt(new Vec3(295, 72, -56));
if (tableBlock && lib.count('iron_ingot') >= 4) {
  let target = 'iron_boots';
  if (lib.count('iron_ingot') >= 8) target = 'iron_chestplate';
  else if (lib.count('iron_ingot') >= 7) target = 'iron_leggings';
  const r = bot.recipesFor(mcData.itemsByName[target].id, null, 1, tableBlock)[0];
  if (r) {
    await bot.craft(r, 1, tableBlock);
    console.log(`Crafted ${target}!`);
    await lib.equipArmor();
  }
}

console.log(`Beta status: food=${bot.food}/20, health=${bot.health}/20, iron_ingots=${lib.count('iron_ingot')}`);
bot.chat(`beta: At base. Food: ${bot.food}/20, Health: ${bot.health}/20, 3 pickaxes ready. Delta/Alpha status?`);
