// programs/054-find-chest-and-eat.js
// Locate base chest, inspect contents, withdraw food/chestplate/ingots, eat to 20 food!

console.log('alpha at:', lib.fmt(bot.entity.position), 'food:', bot.food, 'health:', bot.health);

// 1. Locate chest in base
const chests = lib.find('chest', { maxDistance: 16 });
console.log(`Found ${chests.length} chests in base:`);
chests.forEach(c => console.log(`  chest at ${lib.fmt(c.position)}`));

let contents = {};
let chestCoord = null;
if (chests.length > 0) {
  chestCoord = chests[0].position;
  try {
    contents = await lib.chestContents(chestCoord.x, chestCoord.y, chestCoord.z);
    console.log('Chest contents:', JSON.stringify(contents));
  } catch (e) {
    console.log('Chest read error:', e.message);
  }
}

// 2. Withdraw food if present
const foodItems = Object.keys(contents).filter(k => k.startsWith('cooked_') || ['apple', 'bread', 'beef', 'porkchop', 'mutton'].includes(k));
if (foodItems.length > 0 && chestCoord) {
  console.log(`Withdrawing food: ${foodItems[0]} x${contents[foodItems[0]]}...`);
  try {
    await lib.withdraw({ [foodItems[0]]: contents[foodItems[0]] }, chestCoord.x, chestCoord.y, chestCoord.z);
  } catch (e) {}
}

// 3. Eat to restore hunger
console.log('Eating food...');
while (bot.food < 20) {
  try {
    await lib.eat();
    console.log('Food now:', bot.food);
  } catch (e) {
    console.log('Eat note:', e.message);
    break;
  }
}

// 4. Check if iron_chestplate or iron_ingots are in chest
if (contents.iron_chestplate > 0 && chestCoord) {
  console.log('Withdrawing iron_chestplate from chest...');
  await lib.withdraw({ iron_chestplate: 1 }, chestCoord.x, chestCoord.y, chestCoord.z);
  await lib.equipArmor();
}
if (contents.iron_ingot > 0 && chestCoord) {
  console.log(`Withdrawing ${contents.iron_ingot} iron ingots from chest...`);
  await lib.withdraw({ iron_ingot: contents.iron_ingot }, chestCoord.x, chestCoord.y, chestCoord.z);
}

// 5. If we now have >= 8 iron ingots, craft iron_chestplate
if (lib.count('iron_chestplate') === 0 && lib.count('iron_ingot') >= 8) {
  await lib.craft('iron_chestplate', 1);
  console.log('Crafted alpha iron_chestplate!');
  await lib.equipArmor();
}

await lib.equipArmor();
await lib.equipWeapon();

const slots = bot.inventory.slots;
console.log('CURRENT ARMOR STATUS:');
console.log('  Head:', slots[5]?.name);
console.log('  Torso:', slots[6]?.name);
console.log('  Legs:', slots[7]?.name);
console.log('  Feet:', slots[8]?.name);
console.log('  Offhand:', slots[45]?.name);

const time = lib.time();
console.log('Night in:', time.secondsUntilNight, 's');

return {
  worn: {
    head: slots[5]?.name,
    torso: slots[6]?.name,
    legs: slots[7]?.name,
    feet: slots[8]?.name,
    offhand: slots[45]?.name
  },
  food: bot.food,
  health: bot.health,
  time: time.secondsUntilNight
};
