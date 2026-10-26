// programs/400-step-to-delta-and-collaborate.js
console.log('=== Program 400: Step to Delta & Establish Fortress Deck Breach ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Walk directly to Delta at (45, 66, -127)
console.log('Moving directly to Delta at (45, 66, -127)...');
try {
  await lib.goTo(45, 66, -127, 1, { timeoutMs: 10000 });
} catch (e) {
  console.log('Move note:', e.message);
  await bot.lookAt(new Vec3(45, 66, -127));
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);
}

console.log('Alpha now at:', lib.fmt(bot.entity.position));

// 2. Alert Delta to toss supplies
bot.chat('team: Delta toss food, blocks, and armor to Alpha! Standing right beside you.');

// 3. Pick up any delivered items
for (let i = 0; i < 6; i++) {
  if (isCancelled()) break;
  await lib.pickup(4);
  await sleep(600);
}

// 4. Eat any food in inventory
const foodItems = bot.inventory.items().filter(it => 
  ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple', 'baked_potato', 'beef', 'porkchop'].includes(it.name)
);
console.log('Food in inventory:', foodItems.map(it => `${it.name}x${it.count}`));

for (const fi of foodItems) {
  while (bot.food < 20 && bot.inventory.count(fi.type) > 0) {
    console.log(`Eating ${fi.name}...`);
    try { await globalThis.safeEat(fi.name); } catch (e) { break; }
  }
}

// Equip armor if received
await lib.equipArmor();

// 5. Regenerate health if food >= 18
if (bot.food >= 18 && bot.health < 20) {
  console.log('Regenerating health safely...');
  for (let r = 0; r < 12 && bot.health < 20; r++) {
    if (isCancelled()) break;
    await sleep(1500);
    console.log(`HP: ${bot.health}/20, Food: ${bot.food}/20`);
  }
}

// 6. Report status
bot.chat(`team: Fortress Breach station active at (${lib.fmt(bot.entity.position)})! Alpha HP=${bot.health}/20, Food=${bot.food}/20. Alpha, Beta, Delta united!`);

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
