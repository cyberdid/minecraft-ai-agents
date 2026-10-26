// programs/242-hunt-food-and-prep-portal.js
console.log('=== Program 242: Hunt Food to Regenerate & Prep Obsidian ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.chat('beta: Beta, craft flint_and_steel with your flint and iron! I am getting quick food, then heading to (286, 18, 8) to quench and mine 10 obsidian!');

// 1. Step outside base to hunt nearest animal
console.log('Stepping outside to hunt food...');
try {
  await lib.goTo(294, 72, -52, 2, { dig: true, timeoutMs: 15000 });
} catch (e) {}

// Find animal on grass
const animal = bot.nearestEntity(e => (e.name === 'pig' || e.name === 'cow' || e.name === 'sheep' || e.name === 'chicken') && e.position.distanceTo(bot.entity.position) < 32);

if (animal) {
  console.log(`Found ${animal.name} at ${lib.fmt(animal.position)}!`);
  const sword = mcData.itemsByName.stone_sword.id;
  await bot.equip(sword, 'hand');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(animal.position.x, animal.position.y, animal.position.z, 2));
    for (let i = 0; i < 4; i++) {
      bot.attack(animal);
      await sleep(600);
      if (!animal.isValid) break;
    }
    await lib.pickup(6);
    console.log('Hunted animal, picked up drops!');
  } catch (e) {
    console.log('Hunt note:', e.message);
  }
}

// 2. Eat food
const meatNames = ['porkchop', 'cooked_porkchop', 'beef', 'cooked_beef', 'mutton', 'cooked_mutton', 'chicken'];
for (const m of meatNames) {
  if (lib.count(m) > 0) {
    console.log(`Eating ${m}...`);
    try {
      const item = bot.inventory.items().find(i => i.name === m);
      if (item) {
        await bot.equip(item, 'hand');
        bot.activateItem();
        await sleep(2000);
        bot.deactivateItem();
      }
    } catch (e) {}
  }
}

console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
console.log('Alpha inventory:', JSON.stringify(lib.inv()));
