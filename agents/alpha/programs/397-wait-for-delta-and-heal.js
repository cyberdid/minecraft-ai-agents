// programs/397-wait-for-delta-and-heal.js
console.log('=== Program 397: Wait for Delta & Full Health Recovery ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Alert Delta
bot.chat('team: Alpha waiting at sealed bunker door (44, 65, -128). Delta let us know when at the door!');

// 2. Monitor for Delta approaching
for (let t = 0; t < 20; t++) {
  if (isCancelled()) break;
  const delta = bot.players['delta'];
  if (delta && delta.entity) {
    const dist = bot.entity.position.distanceTo(delta.entity.position);
    console.log(`Delta at ${lib.fmt(delta.entity.position)}, dist=${dist.toFixed(1)}m`);
    if (dist < 6) {
      console.log('Delta arrived at bunker! Picking up supplies...');
      await lib.pickup(5);
      break;
    }
  }
  await sleep(1500);
}

// 3. Pick up any delivered items
await lib.pickup(4);

// 4. Eat food if in inventory
const foods = bot.inventory.items().filter(it => 
  ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple', 'baked_potato', 'beef'].includes(it.name)
);
console.log('Food in inv:', foods.map(it => `${it.name}x${it.count}`));

for (const f of foods) {
  while (bot.food < 20 && bot.inventory.count(f.type) > 0) {
    console.log(`Eating ${f.name}...`);
    try { await globalThis.safeEat(f.name); } catch (e) { break; }
  }
}

// Equip any armor received
await lib.equipArmor();

// 5. Regenerate health if food >= 18
if (bot.food >= 18 && bot.health < 20) {
  console.log('Regenerating health inside bunker...');
  for (let r = 0; r < 15 && bot.health < 20; r++) {
    if (isCancelled()) break;
    await sleep(1500);
    console.log(`Health: ${bot.health}/20, Food: ${bot.food}/20`);
  }
}

bot.chat(`team: Fortress Workshop status: Alpha HP=${bot.health}/20, Food=${bot.food}/20, Gear=${JSON.stringify(lib.tools())}.`);

console.log('Alpha inventory:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
