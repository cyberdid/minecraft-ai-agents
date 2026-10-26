// programs/398-receive-food-and-heal-to-full.js
console.log('=== Program 398: Receive Food from Delta & Regenerate to Full HP ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Ask Delta to toss food
bot.chat('team: Delta, please toss cooked food to Alpha! Standing next to you at (44, 65, -128).');

// 2. Pick up items tossed by Delta
for (let i = 0; i < 8; i++) {
  if (isCancelled()) break;
  await lib.pickup(4);
  await sleep(1000);
}

// 3. Eat food to 20/20
const foods = bot.inventory.items().filter(it => 
  ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple', 'baked_potato', 'beef', 'porkchop'].includes(it.name)
);
console.log('Food in inventory:', foods.map(it => `${it.name}x${it.count}`));

for (const f of foods) {
  while (bot.food < 20 && bot.inventory.count(f.type) > 0) {
    console.log(`Eating ${f.name}...`);
    try { await globalThis.safeEat(f.name); } catch (e) { break; }
  }
}

// Equip armor if received
await lib.equipArmor();

// 4. Wait for health to regenerate to 20
if (bot.food >= 18 && bot.health < 20) {
  console.log('Regenerating health inside bunker...');
  for (let r = 0; r < 20 && bot.health < 20; r++) {
    if (isCancelled()) break;
    await sleep(1500);
    console.log(`Health: ${bot.health}/20, Food: ${bot.food}/20`);
  }
}

bot.chat(`team: Alpha recovered! HP: ${bot.health}/20, Food: ${bot.food}/20. Alpha, Beta, Delta united at Fortress Workshop!`);

console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
