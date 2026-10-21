// programs/091-hunt-and-cook.js
// Door helpers defined inline
async function passDoorOut() {
  await lib.door(294, 72, -54, true);
  await sleep(200);
  await lib.walkTo(294.5, -52);
  await lib.door(294, 72, -54, false);
}

async function passDoorIn() {
  await lib.door(294, 72, -54, true);
  await sleep(200);
  await lib.walkTo(294.5, -56);
  await lib.door(294, 72, -54, false);
}

console.log('alpha health before:', bot.health, '| food:', bot.food, '| time:', lib.time().timeOfDay);
bot.chat('alpha: Heading north to hunt cow for food, then cooking steak.');

// 1. Step outside base cleanly
await passDoorOut();
console.log('Outside base! Pos:', lib.fmt(bot.entity.position));

// 2. Hunt cow
console.log('Hunting cow...');
await lib.hunt('cow', 1);

// Pick up drops
await lib.pickup(6);

// Also hunt chicken if nearby
try {
  const chicken = bot.nearestEntity(e => e.name === 'chicken' && e.position.distanceTo(bot.entity.position) < 20);
  if (chicken) {
    console.log('Hunting nearby chicken...');
    await lib.hunt('chicken', 1);
    await lib.pickup(6);
  }
} catch (e) {}

// 3. Return to base
console.log('Returning to base entrance at (294, 72, -52)...');
await lib.goToXZ(294, -52);

// 4. Step inside cleanly
await passDoorIn();
console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// 5. Cook meat
const meats = ['beef', 'chicken', 'mutton', 'porkchop'].filter(m => lib.count(m) > 0);
console.log('Meats to cook:', meats);
for (const m of meats) {
  const n = lib.count(m);
  console.log(`Cooking ${n} ${m}...`);
  if (lib.count('*_planks') < 2) {
    await lib.craft('oak_planks', 4);
  }
  await lib.smelt(m, 'oak_planks', n);
}

// 6. Eat
console.log('Eating cooked meat...');
await lib.eat();
if (lib.count('cooked_beef') > 0 || lib.count('cooked_chicken') > 0) {
  await lib.eat();
}

console.log('Health after:', bot.health, '| food:', bot.food, '| inv:', JSON.stringify(lib.inv()));
bot.chat(`alpha: Ate cooked steak! Health: ${Math.round(bot.health)}/20, Food: ${bot.food}/20.`);
