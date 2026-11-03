// programs/512-interact-teammate.js
console.log('=== GAMMA: COOPERATE WITH TEAMMATE IN BUNKER ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Identify nearby teammates
const players = Object.values(bot.entities).filter(e =>
  e.type === 'player' && e.username !== bot.username && bot.entity.position.distanceTo(e.position) <= 8
);

for (const p of players) {
  console.log(`Teammate: ${p.username} at ${lib.fmt(p.position)}, dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
  bot.chat(`gamma: Hey ${p.username}! I am at HP 5.1, Food 9. Please toss 2-3 cooked food so I can heal!`);
}

// 2. Wait 6 seconds for any toss and vacuum items
console.log('Waiting 6s for teammate response / item drops...');
await sleep(6000);

const picked = await lib.pickup(5.0);
console.log(`Items picked up: ${picked}`);

// 3. Check for food and eat
const food = bot.inventory.items().filter(i =>
  i.name.includes('cooked_') || i.name === 'bread' || i.name === 'apple' || i.name === 'baked_potato' || i.name === 'cooked_porkchop' || i.name === 'cooked_beef' || i.name === 'cooked_mutton'
);
if (food.length > 0) {
  console.log(`Food available: ${food.map(f => `${f.name} x${f.count}`).join(', ')}`);
  try {
    await lib.eat();
    console.log(`Ate food! New Food: ${bot.food}, HP: ${bot.health}`);
  } catch (e) {
    console.log('Eat error:', e.message);
  }
} else {
  console.log('No food in inventory yet.');
}

// 4. Check crafting table in bunker or nearby
const tables = bot.findBlocks({
  matching: mcData.blocksByName.crafting_table.id,
  maxDistance: 8,
  count: 3
});
console.log(`Crafting tables in bunker: ${tables.length}`);

// 5. Check if any gold nuggets can be crafted into ingots
if (lib.count('gold_nugget') >= 9) {
  try {
    await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
    console.log(`Crafted ingots! Total gold_ingot: ${lib.count('gold_ingot')}`);
  } catch (e) {}
}

bot.chat(`gamma: Bunker status - HP: ${bot.health.toFixed(1)}, Food: ${bot.food}/20, Boots: golden_boots (worn), Ingots: ${lib.count('gold_ingot')}, Pearls: ${lib.count('ender_pearl')}/12`);

return {
  hp: bot.health,
  food: bot.food,
  ingots: lib.count('gold_ingot'),
  pearls: lib.count('ender_pearl'),
  teammates: players.map(p => p.username),
  inv: lib.inv()
};
