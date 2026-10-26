// programs/418-cook-eat-chest-and-portal-ready.js
console.log('=== Program 418: Cook Chicken, Check Chest & Prepare Nether Transit ===');
console.log('Alpha start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Enter base shelter (294, 72, -54)
console.log('Entering base...');
try {
  await lib.goTo(294.5, 72, -52, 1, { timeoutMs: 15000 });
  await globalThis.passDoorIn();
  console.log('Safely inside base at:', lib.fmt(bot.entity.position));
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

// 2. Check base chest at (293, 72, -57)
console.log('Inspecting base chest for food and gear...');
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(contents));
  
  const toWithdraw = {};
  for (const item of ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken', 'bread', 'apple', 'iron_ingot', 'shield', 'iron_sword', 'iron_pickaxe']) {
    if (contents[item] > 0) toWithdraw[item] = contents[item];
  }
  if (Object.keys(toWithdraw).length > 0) {
    console.log('Withdrawing:', JSON.stringify(toWithdraw));
    await lib.withdraw(toWithdraw, 293, 72, -57);
  }
} catch (e) {
  console.log('Chest note:', e.message);
}

// 3. Smelt raw chicken in furnace (295, 72, -55)
const chickenCount = lib.count('chicken');
if (chickenCount > 0) {
  console.log(`Smelting ${chickenCount} chicken in furnace...`);
  try {
    const fBlock = bot.blockAt(new Vec3(295, 72, -55));
    if (fBlock) {
      const f = await bot.openFurnace(fBlock);
      const coal = bot.inventory.items().find(i => i.name === 'coal');
      const chk = bot.inventory.items().find(i => i.name === 'chicken');
      if (coal) await f.putFuel(coal.type, null, 1);
      if (chk) await f.putInput(chk.type, null, chk.count);
      
      for (let w = 0; w < chickenCount * 11; w++) {
        await sleep(1000);
        if (f.outputItem()) {
          console.log(`Taking cooked ${f.outputItem().name}x${f.outputItem().count}...`);
          await f.takeOutput();
        }
        if (lib.count('chicken') === 0 && !f.inputItem()) break;
      }
      f.close();
    }
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
}

// 4. Eat all cooked food in inventory
const cookedFoods = ['cooked_chicken', 'cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'];
for (const cf of cookedFoods) {
  while (lib.count(cf) > 0 && bot.food < 20) {
    console.log(`Eating ${cf}...`);
    await globalThis.safeEat(cf);
    await sleep(250);
  }
}

console.log('Food after eating:', bot.food, 'Health:', bot.health);

// 5. Craft shield if iron ingot and planks available
try {
  if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1) {
    if (lib.count('*_planks') < 6 && lib.count('*_log') > 0) {
      const log = bot.inventory.items().find(i => i.name.endsWith('_log'));
      if (log) await lib.craft(log.name.replace('_log', '_planks'), 4);
    }
    if (lib.count('*_planks') >= 6) {
      await lib.craft('shield', 1);
      console.log('Shield crafted!');
    }
  }
} catch (e) {
  console.log('Shield craft note:', e.message);
}

// 6. Equip armor and weapon
await lib.equipArmor();
await lib.equipWeapon();

// 7. Report to team
bot.chat(`team: Alpha fed & armed! Health=${bot.health}/20, Food=${bot.food}/20, Cobble=${lib.count('cobblestone')}. Entering Nether portal at (298, 72, -54) now!`);

console.log('Alpha final pos:', lib.fmt(bot.entity.position));
console.log('Alpha final inv:', JSON.stringify(lib.inv()));
console.log('Alpha final status:', JSON.stringify(lib.status()));
