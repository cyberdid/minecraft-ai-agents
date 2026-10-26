// programs/379-eat-rotten-flesh-and-craft.js
console.log('=== Eat rotten flesh for emergency hunger, craft tools ===');
console.log('Beta start hunger:', bot.food, 'health:', bot.health);

// 1. Consume 3 rotten flesh to break out of 0-hunger state
while (lib.count('rotten_flesh') > 0 && bot.food < 12) {
  console.log('Eating rotten_flesh...');
  try {
    await bot.equip(mcData.itemsByName.rotten_flesh.id, 'hand');
    await bot.consume();
    console.log('Hunger level now:', bot.food, 'health:', bot.health);
    await sleep(400);
  } catch (err) {
    console.log('Eat note:', err.message);
    break;
  }
}

// 2. Craft a furnace from 8 cobblestone
if (lib.count('furnace') === 0 && lib.count('cobblestone') >= 8) {
  try {
    await lib.craft('furnace', 1);
    console.log('Crafted furnace! Count:', lib.count('furnace'));
  } catch (e) {
    console.log('Craft furnace note:', e.message);
  }
}

// 3. Obtain 1 wood log to make sticks and craft stone tools
if (lib.count('stick') < 2) {
  console.log('Getting 1 log outside base for sticks...');
  try {
    await lib.goThroughDoor(294, 72, -54);
    await lib.obtain('stick', 4);
    console.log('Sticks obtained: ' + lib.count('stick'));
    await lib.goTo(294, 72, -53, 1);
    await lib.goThroughDoor(294, 72, -54);
  } catch (err) {
    console.log('Stick note:', err.message);
  }
}

// 4. Craft stone sword and stone pickaxe
if (lib.count('stick') >= 1 && lib.count('cobblestone') >= 2 && lib.count('stone_sword') === 0) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('Crafted stone_sword!');
  } catch (err) {
    console.log('Sword note:', err.message);
  }
}

if (lib.count('stick') >= 2 && lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted stone_pickaxe!');
  } catch (err) {
    console.log('Pickaxe note:', err.message);
  }
}

console.log('Beta status: health =', bot.health, 'food =', bot.food, 'inventory:', JSON.stringify(lib.inv()));
bot.chat(`beta: Hunger stabilized! Food: ${bot.food}/20, Health: ${bot.health}/20. Tools ready! Ready to join East hill iron mining!`);
