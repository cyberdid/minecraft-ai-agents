// programs/395-seal-bunker-and-request-food.js
console.log('=== Program 395: Seal Bunker, Eat & Plan Fortress Deck Descent ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Ask Beta to toss food
bot.chat('team: Beta toss 1-2 cooked food! Alpha at 2 HP in bunker with you.');

// 2. Seal bunker doorway if open
const p = bot.entity.position;
console.log('Checking surrounding bunker blocks at y=65:');
for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
  const b = bot.blockAt(p.offset(dx, 0, dz));
  console.log(`  Offset (${dx}, ${dz}): ${b?.name}`);
  // If air and open to outside, place cobblestone
  if (b && b.name === 'air' && lib.count('cobblestone') > 0) {
    try {
      console.log(`Sealing gap at (${dx}, ${dz})...`);
      await lib.place('cobblestone', p.x + dx, p.y, p.z + dz);
    } catch (e) {}
  }
}

// 3. Pick up any food tossed by Beta
for (let i = 0; i < 5; i++) {
  await lib.pickup(3);
  await sleep(600);
}

// 4. Eat any food in inventory
const foodItems = bot.inventory.items().filter(it => 
  ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple', 'baked_potato', 'beef'].includes(it.name)
);
console.log('Food in inventory:', foodItems.map(it => `${it.name}x${it.count}`));

for (const fi of foodItems) {
  while (bot.food < 20 && bot.inventory.count(fi.type) > 0) {
    console.log(`Eating ${fi.name}...`);
    try { await globalThis.safeEat(fi.name); } catch (e) { break; }
  }
}

// 5. Wait for health regen if food >= 18
if (bot.food >= 18 && bot.health < 20) {
  console.log('Regenerating health inside bunker...');
  for (let r = 0; r < 12 && bot.health < 20; r++) {
    if (isCancelled()) break;
    await sleep(1500);
    console.log(`HP: ${bot.health}/20, Food: ${bot.food}/20`);
  }
}

// 6. Inspect vertical column for staircase down to fortress deck (y=53)
console.log('Inspecting descent shaft down to fortress deck (y=53):');
for (let y = 64; y >= 53; y--) {
  const b = bot.blockAt(new Vec3(44, y, -129));
  console.log(`  Shaft y=${y}: ${b?.name}`);
}

bot.chat(`team: Alpha & Beta fortress bunker sealed at (${lib.fmt(bot.entity.position)}). HP: ${bot.health}/20, Food: ${bot.food}/20. Ready for deck descent!`);

console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
