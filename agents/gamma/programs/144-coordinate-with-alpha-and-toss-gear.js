// programs/144-coordinate-with-alpha-and-toss-gear.js
console.log('--- COORDINATE WITH ALPHA & PREPARE BREACH ---');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Check Alpha
const alpha = bot.players['alpha']?.entity;
if (alpha) {
  console.log(`Alpha is at: ${lib.fmt(alpha.position)}, dist: ${alpha.position.distanceTo(bot.entity.position).toFixed(1)}m`);
  
  // Toss spare stone_sword if we have 2
  if (lib.count('stone_sword') >= 2) {
    console.log('Tossing spare stone_sword towards Alpha...');
    const swordItem = bot.inventory.items().find(i => i.name === 'stone_sword');
    if (swordItem) {
      await bot.lookAt(alpha.position.offset(0, 1, 0), true);
      await bot.toss(swordItem.type, null, 1);
      console.log('Tossed stone_sword!');
    }
  }
}

// 2. Chat with Alpha & Delta
bot.chat('Alpha, Gamma tossed you a stone_sword! If you have any food, toss 1 or 2 to Gamma. Delta is arriving with 34 cobble!');

// 3. Inspect the front wall at z=-142..-143
console.log('Inspecting forward blocks along z=-141..-144:');
for (let z = -141; z >= -144; z--) {
  for (let y = 64; y <= 67; y++) {
    const b = bot.blockAt(new Vec3(44, y, z));
    console.log(`(44, ${y}, ${z}): ${b ? b.name : 'null'}`);
  }
}

// 4. Pickup any dropped food
await sleep(2000);
await lib.pickup(4);

// If we got food, eat it!
const foodItem = bot.inventory.items().find(i => 
  i.name.includes('cooked') || i.name.includes('bread') || i.name.includes('apple') ||
  i.name.includes('beef') || i.name.includes('pork') || i.name.includes('mutton')
);

if (foodItem) {
  console.log('Found food in inventory:', foodItem.name);
  try {
    await lib.eat(foodItem.name);
    console.log('Ate food! New food level:', bot.food);
  } catch (e) {
    console.log('Eat error:', e.message);
  }
}

console.log('Gamma status now: HP=', bot.health, 'Food=', bot.food, 'Inv=', JSON.stringify(lib.inv()));
