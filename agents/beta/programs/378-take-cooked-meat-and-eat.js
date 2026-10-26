// programs/378-take-cooked-meat-and-eat.js
console.log('=== Step: Take cooked meat from base furnace, eat to full, check iron ===');
console.log('Beta start pos:', lib.fmt(bot.entity.position), 'food:', bot.food, 'health:', bot.health);

bot.chat('beta: Inside base! Checking furnaces for Gamma\'s cooked meat and iron ingots!');

// 1. Move inside base towards furnaces
try {
  await lib.goTo(294, 72, -55, 1, { timeoutMs: 10000 });
} catch (e) {
  console.log('Move inside note:', e.message);
}

// 2. Check F1, F2, F3 for cooked food or iron
const furnaces = [
  ['F1', [295, 72, -55]],
  ['F2', [295, 72, -54]],
  ['F3', [295, 72, -56]]
];

let foundFood = false;
for (const [name, pos] of furnaces) {
  const fb = bot.blockAt(new Vec3(...pos));
  if (fb) {
    try {
      const f = await bot.openFurnace(fb);
      const out = f.outputItem();
      console.log(`${name}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, output=${out?.name}x${out?.count}`);
      if (out && out.count > 0) {
        await f.takeOutput();
        console.log(`Took ${out.name}x${out.count} from ${name}`);
        if (out.name.startsWith('cooked_')) {
          foundFood = true;
        }
      }
      f.close();
    } catch (err) {
      console.log(`${name} note:`, err.message);
    }
  }
}

// 3. Check chest if food was put into chest
if (!foundFood) {
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const foods = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken', 'bread', 'apple'];
      for (const cf of foods) {
        const it = chest.containerItems().find(i => i.name === cf);
        if (it) {
          await chest.withdraw(it.type, null, it.count);
          console.log(`Withdrew ${cf}x${it.count} from chest!`);
          break;
        }
      }
      chest.close();
    } catch (e) {
      console.log('Chest note:', e.message);
    }
  }
}

// 4. Pickup any food Gamma dropped on the ground
await lib.pickup(6);

// 5. Eat food until full!
const eatables = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken', 'bread', 'apple', 'beef', 'mutton'];
for (const f of eatables) {
  while (lib.count(f) > 0 && bot.food < 20 && !isCancelled()) {
    console.log(`Eating ${f}...`);
    try {
      await bot.equip(mcData.itemsByName[f].id, 'hand');
      await bot.consume();
      console.log('Hunger now:', bot.food, 'health:', bot.health);
      await sleep(500);
    } catch (err) {
      console.log('Eat note:', err.message);
      break;
    }
  }
}

// 6. Report status
console.log('Beta final status: health =', bot.health, 'food =', bot.food, 'inventory:', JSON.stringify(lib.inv()));
bot.chat(`beta: Fed! Health: ${bot.health}/20, Food: ${bot.food}/20. Iron ingots: ${lib.count('iron_ingot')}. Ready to craft iron armor!`);
