// programs/188-emergency-food-hunt.js
console.log('Pos:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'Health:', bot.health);

// Scan nearby animals
const animals = ['cow', 'sheep', 'pig', 'chicken'];
const targets = [];
for (const e of Object.values(bot.entities)) {
  if (e && animals.includes(e.name) && e.position) {
    targets.push({ name: e.name, pos: lib.fmt(e.position), dist: e.position.distanceTo(bot.entity.position).toFixed(1) });
  }
}
console.log(`Found ${targets.length} animals nearby:`, JSON.stringify(targets));

// Hunt nearest animal
if (targets.length > 0) {
  const nearest = targets.sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist))[0];
  console.log(`Hunting nearest ${nearest.name}...`);
  try {
    await lib.hunt(nearest.name, 1);
  } catch (e) {
    console.log('Hunt error:', e.message);
  }
} else {
  // explore a short distance to find an animal
  try {
    console.log('Exploring to find animal...');
    await lib.hunt('sheep', 1);
  } catch (e) {
    try {
      await lib.hunt('chicken', 1);
    } catch (e2) {
      console.log('Hunt fallback error:', e2.message);
    }
  }
}

// Check raw meat in inventory
const rawMeats = ['mutton', 'beef', 'porkchop', 'chicken'];
const meat = rawMeats.find(m => lib.count(m) > 0);
if (meat) {
  console.log(`Smelting ${meat}...`);
  // craft planks from log if needed
  if (lib.count('*_planks') < 2 && lib.count('*_log') > 0) {
    const l = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
    await lib.craft(l.replace('_log', '_planks'), 4);
  }
  try {
    await lib.smelt(meat, 'birch_planks', lib.count(meat));
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
  
  // Eat cooked food or raw meat
  const cooked = 'cooked_' + meat;
  const foodItem = bot.inventory.items().find(i => i.name === cooked || i.name === meat);
  if (foodItem) {
    console.log(`Eating ${foodItem.name}...`);
    await bot.equip(foodItem, 'hand');
    bot.deactivateItem();
    bot.activateItem();
    await sleep(2000);
    bot.deactivateItem();
    console.log('Ate! Food now:', bot.food);
  }
}

console.log('End food:', bot.food, 'Health:', bot.health);
