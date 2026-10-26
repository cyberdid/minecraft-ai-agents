// programs/386-fortify-outpost-heal-and-rearm.js
console.log('=== Program 386: Fortify Fortress Outpost & Heal with Beta ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Alert Beta in chat to share/toss gear
bot.chat('team: Beta, Alpha is next to you at (44, 65, -129)! Toss food and armor so we both heal and gear up!');

// 2. Pick up any items around feet
for (let p = 0; p < 4; p++) {
  await lib.pickup(4);
  await sleep(400);
}

// 3. Equip armor if we picked up any
await lib.equipArmor();

// 4. Eat food if in inventory
const foodItems = bot.inventory.items().filter(i => 
  ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple', 'baked_potato', 'beef'].includes(i.name)
);
console.log('Food in inventory:', foodItems.map(i => `${i.name}x${i.count}`));

for (const fi of foodItems) {
  while (bot.food < 20 && bot.inventory.count(fi.type) > 0) {
    console.log(`Eating ${fi.name}...`);
    try {
      await globalThis.safeEat(fi.name);
    } catch (e) {
      try { await lib.eat(); } catch (e2) { break; }
    }
  }
}

// 5. Build/seal cobblestone bunker around (44..45, 65..67, -129..-130)
if (lib.count('cobblestone') >= 4) {
  console.log('Placing tactical barrier blocks to seal outpost...');
  // Place wall towards exposed north (z = -132)
  try {
    await lib.place('cobblestone', 45, 65, -131);
    await lib.place('cobblestone', 45, 66, -131);
  } catch (e) {}
}

// 6. Wait for health regeneration
if (bot.food >= 18 && bot.health < 20) {
  console.log('Regenerating health safely inside outpost...');
  for (let r = 0; r < 15 && bot.health < 20; r++) {
    if (isCancelled()) break;
    await sleep(1500);
    console.log(`HP: ${bot.health}/20, Food: ${bot.food}/20`);
  }
}

// 7. Check Beta status
const beta = bot.players['beta'];
if (beta && beta.entity) {
  console.log(`Beta at ${lib.fmt(beta.entity.position)}, dist=${bot.entity.position.distanceTo(beta.entity.position).toFixed(1)}m`);
}

bot.chat(`team: Alpha & Beta fortress bunker secure at (${lib.fmt(bot.entity.position)}). HP: ${bot.health}/20, Food: ${bot.food}/20. Gear: ${JSON.stringify(lib.tools())}.`);

console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
