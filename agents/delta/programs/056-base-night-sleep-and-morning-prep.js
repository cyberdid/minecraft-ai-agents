// programs/056-base-night-sleep-and-morning-prep.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Wait for night window (12542 ticks) while checking chest for food
const chestPos = new Vec3(293, 72, -57);
const foodKeys = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken', 'bread', 'apple', 'beef', 'mutton', 'porkchop', 'chicken'];

while (!isCancelled() && lib.time().timeOfDay < 12542 && lib.time().secondsUntilNight > 0) {
  if (bot.food < 18) {
    try {
      const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
      for (const fk of foodKeys) {
        if (chest[fk]) {
          await lib.withdraw({ [fk]: 1 }, chestPos.x, chestPos.y, chestPos.z);
          await lib.eat();
          console.log(`Ate ${fk}! Food now: ${bot.food}, Health: ${bot.health}`);
          break;
        }
      }
    } catch (e) {}
  }
  await sleep(1000);
}

// 2. Sleep in Bed 2 at dusk
console.log('Sleeping in Bed 2 at (293, 72, -55)...');
const bed2 = bot.blockAt(new Vec3(293, 72, -55));
if (bed2 && bed2.name.includes('bed')) {
  try {
    await bot.sleep(bed2);
    console.log('Sleeping in Bed 2!');
    await sleep(5000);
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

console.log('Time after sleep:', JSON.stringify(lib.time()));

// 3. Morning iron check
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
for (const f of furnaces) {
  try {
    const fw = await bot.openFurnace(bot.blockAt(f));
    if (fw.outputItem()) {
      await fw.takeOutput();
      console.log(`Took ${fw.outputItem().count} ${fw.outputItem().name} from furnace!`);
    }
    await fw.close();
  } catch (e) {}
}

try {
  const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  if (chest.iron_ingot) {
    await lib.withdraw({ iron_ingot: chest.iron_ingot }, chestPos.x, chestPos.y, chestPos.z);
  }
} catch (e) {}

console.log('Total iron ingots in inventory:', lib.count('iron_ingot'));

// 4. Craft armor if ingots available
const table = bot.findBlocks({ matching: b => b.name === 'crafting_table', maxDistance: 6, count: 1 })[0];
if (table && lib.count('iron_ingot') >= 4) {
  const tableBlock = bot.blockAt(table);
  const pieces = [
    { name: 'iron_chestplate', cost: 8 },
    { name: 'iron_leggings', cost: 7 },
    { name: 'iron_helmet', cost: 5 },
    { name: 'iron_boots', cost: 4 }
  ];
  for (const piece of pieces) {
    if (!lib.count(piece.name) && lib.count('iron_ingot') >= piece.cost) {
      console.log(`Crafting ${piece.name}...`);
      const item = mcData.itemsByName[piece.name];
      const rec = bot.recipesFor(item.id, null, 1, tableBlock)[0];
      if (rec) {
        await bot.craft(rec, 1, tableBlock);
        await sleep(250);
        await lib.stowCursor();
      }
    }
  }
  await lib.equipArmor();
  await lib.equipWeapon();
}

console.log('Final tools & armor:', JSON.stringify(lib.tools()));
bot.chat(`delta: Base morning status: Health ${bot.health}/20, Food ${bot.food}/20. Iron ingots: ${lib.count('iron_ingot')}.`);
