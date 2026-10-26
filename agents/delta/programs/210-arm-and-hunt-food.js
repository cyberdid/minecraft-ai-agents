// programs/210-arm-and-hunt-food.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.chat('delta: Crafting stone tools, cobblestone, and hunting food for the team...');

// 1. Obtain stone_pickaxe
console.log('Obtaining stone_pickaxe...');
try {
  await lib.obtain('stone_pickaxe', 1);
  console.log('Obtained stone_pickaxe!');
} catch (e) {
  console.log('Pickaxe error:', e.message);
}

// 2. Obtain stone_sword
console.log('Obtaining stone_sword...');
try {
  await lib.obtain('stone_sword', 1);
  console.log('Obtained stone_sword!');
} catch (e) {
  console.log('Sword error:', e.message);
}

// 3. Obtain 24 cobblestone
console.log('Obtaining 24 cobblestone...');
try {
  await lib.obtain('cobblestone', 24);
  console.log('Obtained 24 cobblestone!');
} catch (e) {
  console.log('Cobblestone error:', e.message);
}

// 4. Hunt nearby passive mobs for food
console.log('Hunting animals for food...');
for (const mobName of ['cow', 'pig', 'sheep', 'chicken']) {
  if (isCancelled()) break;
  try {
    const hunted = await lib.hunt(mobName, 2);
    console.log(`Hunted ${mobName}:`, JSON.stringify(hunted));
    break; // Got meat!
  } catch (e) {
    console.log(`Hunt ${mobName} notice:`, e.message);
  }
}

// 5. Smelt raw meat in base furnace
const rawMeats = ['raw_beef', 'raw_porkchop', 'raw_mutton', 'raw_chicken'];
for (const meat of rawMeats) {
  const count = lib.count(meat);
  if (count > 0) {
    console.log(`Smelting ${count} ${meat} in furnace...`);
    try {
      // Find fuel: planks or logs
      const fuel = lib.count('*_planks') > 0 ? SCAFFOLD.find(n => n.includes('planks') && lib.count(n) > 0) : 'oak_log';
      await lib.smelt(meat, fuel || 'birch_planks', count);
      console.log(`Smelted ${meat}!`);
    } catch (e) {
      console.log(`Smelt ${meat} error:`, e.message);
    }
  }
}

// 6. Return to base shelter
const doorPos = new Vec3(294, 73, -54);
console.log('Returning inside base...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
} catch (e) {
  await lib.goTo(293, 72, -55, 1);
}

// 7. Deposit 2 cooked food into chest for starving teammates if we have 3+
const cookedMeats = ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken'];
for (const cooked of cookedMeats) {
  if (lib.count(cooked) >= 2) {
    try {
      const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
      if (chestBlock) {
        const chest = await bot.openChest(chestBlock);
        const item = lib.bot().inventory.items().find(i => i.name === cooked);
        if (item) {
          await chest.deposit(item.type, null, 2);
          console.log(`Deposited 2 ${cooked} in chest for teammates!`);
          bot.chat(`delta: Deposited 2 ${cooked} in base chest for Alpha & Gamma!`);
        }
        chest.close();
      }
    } catch (e) {
      console.log('Deposit error:', e.message);
    }
    break;
  }
}

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final tools:', JSON.stringify(lib.tools()));
bot.chat(`delta: Fully prepared! Tools: stone_pickaxe & sword, Cobble=${lib.count('cobblestone')}, Food in inv=${lib.inv().cooked_beef || lib.inv().cooked_porkchop || lib.inv().cooked_mutton || 0}. Heading to Nether!`);
