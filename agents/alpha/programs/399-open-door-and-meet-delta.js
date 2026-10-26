// programs/399-open-door-and-meet-delta.js
console.log('=== Program 399: Open Door, Receive Delta & Gamma, & Recover ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Dig doorway block at (44, 65, -128) or (45, 65, -128) to let Delta and Gamma inside
const doorPos = new Vec3(44, 65, -128);
const doorBlock = bot.blockAt(doorPos);
console.log('Doorway block at (44, 65, -128):', doorBlock?.name);
if (doorBlock && doorBlock.name !== 'air' && doorBlock.name !== 'nether_portal') {
  console.log('Digging doorway block to let Delta & Gamma inside...');
  try {
    await lib.dig(doorPos.x, doorPos.y, doorPos.z);
    console.log('Doorway opened!');
  } catch (e) {
    console.log('Dig doorway note:', e.message);
  }
}

bot.chat('team: Doorway opened at (44, 65, -128)! Delta and Gamma come inside the Fortress Workshop!');

// 2. Walk 1 step towards doorway and pick up all delivered items
await sleep(1000);
for (let p = 0; p < 6; p++) {
  if (isCancelled()) break;
  await lib.pickup(5);
  await sleep(600);
}

// 3. Eat any food in inventory
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

// 4. Regenerate health if food >= 18
if (bot.food >= 18 && bot.health < 20) {
  console.log('Regenerating health inside bunker...');
  for (let r = 0; r < 15 && bot.health < 20; r++) {
    if (isCancelled()) break;
    await sleep(1500);
    console.log(`HP: ${bot.health}/20, Food: ${bot.food}/20`);
  }
}

// 5. Scan all teammates inside the workshop
for (const name of ['delta', 'beta', 'gamma']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

bot.chat(`team: Fortress Workshop united! Alpha HP=${bot.health}/20, Food=${bot.food}/20. Tools: ${JSON.stringify(lib.tools())}. Ready for Fortress deck descent!`);

console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
