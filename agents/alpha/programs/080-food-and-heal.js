// programs/080-food-and-heal.js
// 1. Step outside and hunt 2 animals for meat
// 2. Return inside base and smelt meat in furnace
// 3. Eat cooked meat to restore food and regenerate health

console.log('alpha health:', bot.health, '| food:', bot.food, '| time:', lib.time().timeOfDay);

bot.chat('alpha: Stepping outside to hunt food and heal up at dawn.');

// 1. Exit base
await lib.goThroughDoor(294, 72, -54);

// 2. Hunt
let hunted = 0;
for (const mob of ['cow', 'pig', 'sheep']) {
  if (hunted >= 2) break;
  try {
    const e = bot.nearestEntity(ent => ent.name === mob && ent.position.distanceTo(bot.entity.position) < 30);
    if (e) {
      console.log(`Hunting ${mob}...`);
      await lib.hunt(mob, 1);
      hunted++;
    }
  } catch (err) {
    console.log(`Hunt note:`, err.message);
  }
}

// 3. Return inside
console.log('Returning inside base...');
await lib.goToXZ(294, -53);
await lib.goThroughDoor(294, 72, -54);

// 4. Craft planks for fuel
if (lib.count('*_planks') < 4 && lib.count('*_log') > 0) {
  await lib.craft('oak_planks', 4);
}

// 5. Smelt any raw meat
const rawMeats = ['beef', 'mutton', 'porkchop', 'chicken'].filter(m => lib.count(m) > 0);
console.log('Raw meat to smelt:', rawMeats);
for (const m of rawMeats) {
  const c = lib.count(m);
  console.log(`Smelting ${c} ${m}...`);
  try {
    await lib.smelt(m, 'oak_planks', c);
  } catch (e) {
    console.log(`Smelt ${m} note:`, e.message);
  }
}

// 6. Eat cooked food
console.log('Eating food...');
try {
  await lib.eat();
  await lib.eat();
} catch (e) {
  console.log('Eat note:', e.message);
}

console.log('Health after eating:', bot.health, '| food:', bot.food, '| inv:', JSON.stringify(lib.inv()));
bot.chat(`alpha: Food restored! Health: ${Math.round(bot.health)}/20, Food: ${bot.food}/20.`);
