// programs/121-hunt-food-and-cook.js
// 1. Withdraw fuel planks from chest
// 2. Step outside and hunt animals for meat
// 3. Return inside, smelt meat across furnaces, and eat to full health!
// 4. Deposit cooked food into chest for Beta

console.log('alpha health:', bot.health, '| food:', bot.food, '| time:', lib.time().timeOfDay);

bot.chat('alpha: Stepping outside to hunt food for both of us, then cooking in base.');

// 1. Withdraw fuel planks
try {
  await lib.withdraw({ oak_planks: 4 }, 293, 72, -57);
} catch (e) {}

// 2. Step outside
await passDoorOut();
console.log('Outside base! Pos:', lib.fmt(bot.entity.position));

// 3. Hunt animals
for (const mob of ['cow', 'sheep', 'chicken', 'pig']) {
  if (lib.count('beef') + lib.count('mutton') + lib.count('porkchop') + lib.count('chicken') >= 4) break;
  try {
    console.log(`Hunting ${mob}...`);
    await lib.hunt(mob, 2);
    await lib.pickup(6);
  } catch (e) {
    console.log(`Hunt ${mob} note:`, e.message);
  }
}

// 4. Return inside
console.log('Returning to base entrance at (294, 72, -52)...');
await lib.goToXZ(294, -52);
await passDoorIn();
console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// 5. Cook meat
const meats = ['beef', 'mutton', 'chicken', 'porkchop'].filter(m => lib.count(m) > 0);
console.log('Meats to cook:', meats);
for (const m of meats) {
  const n = lib.count(m);
  console.log(`Cooking ${n} ${m}...`);
  try {
    await lib.smelt(m, 'oak_planks', n);
  } catch (e) {
    console.log(`Smelt ${m} error:`, e.message);
  }
}

// 6. Eat cooked food to restore full food and health!
console.log('Eating cooked food...');
try {
  await lib.eat();
  await sleep(1000);
  if (bot.food < 18) await lib.eat();
} catch (e) {
  console.log('Eat note:', e.message);
}

// 7. Deposit cooked food for Beta
const cookedTypes = ['cooked_beef', 'cooked_mutton', 'cooked_chicken', 'cooked_porkchop'].filter(c => lib.count(c) > 0);
for (const c of cookedTypes) {
  const half = Math.floor(lib.count(c) / 2);
  if (half > 0) {
    try {
      await lib.deposit({ [c]: half }, 293, 72, -57);
      console.log(`Deposited ${half} ${c} into chest for Beta.`);
    } catch (e) {}
  }
}

console.log('Alpha health after:', bot.health, '| food:', bot.food, '| inv:', JSON.stringify(lib.inv()));
bot.chat(`alpha: Cooked food ready! Health: ${Math.round(bot.health)}/20, Food: ${bot.food}/20. Food shared in chest.`);
