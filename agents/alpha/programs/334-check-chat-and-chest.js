// programs/334-check-chat-and-chest.js
console.log('=== Program 334: Check Chat, Chest & Teammates ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'hp:', bot.health, 'food:', bot.food);

// 1. Check chest contents
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Base chest contents:', JSON.stringify(contents));
  
  // If any cooked food, withdraw and eat
  const foods = ['cooked_beef', 'cooked_chicken', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'];
  for (const f of foods) {
    if (contents[f] > 0) {
      console.log(`Withdrawing 2 ${f} to eat...`);
      await lib.withdraw({ [f]: Math.min(2, contents[f]) }, chestPos.x, chestPos.y, chestPos.z);
      if (typeof safeEat === 'function') await safeEat(f);
      else await lib.eat();
      console.log(`Food after eating: ${bot.food}/20`);
      break;
    }
  }
  
  // If any iron ingots, withdraw them
  if (contents.iron_ingot > 0) {
    console.log(`Withdrawing ${contents.iron_ingot} iron_ingot...`);
    await lib.withdraw({ iron_ingot: contents.iron_ingot }, chestPos.x, chestPos.y, chestPos.z);
  }
} catch (e) {
  console.log('Chest error:', e.message);
}

// 2. Check teammates positions & held items
for (const [name, p] of Object.entries(bot.players)) {
  if (name === 'alpha') continue;
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name}`);
  } else {
    console.log(`Player ${name} not nearby`);
  }
}

// 3. Check inventory
console.log('Alpha inventory now:', JSON.stringify(lib.inv()));
bot.chat('team: Alpha in base checking iron smelting status. Gamma/Delta, what is total iron ingot count?');
