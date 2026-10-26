// programs/449-enter-base-and-check-gear.js
console.log('=== Program 449: Enter Base & Withdraw Gear ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
await sleep(200);

// 1. Walk to base door
console.log('Walking to base door at (294, 72, -53)...');
await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));

// 2. Enter base
console.log('Entering base...');
try {
  await passDoorIn();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Inspect base chest
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(contents));
  const toWithdraw = {};
  for (const item of [
    'stone_pickaxe', 'iron_pickaxe', 'diamond_pickaxe', 'wooden_pickaxe',
    'stone_sword', 'iron_sword', 'diamond_sword',
    'shield', 'iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots',
    'cobblestone', 'bread', 'cooked_beef', 'cooked_porkchop', 'cooked_mutton',
    'coal', 'charcoal', 'iron_ingot', 'raw_iron', 'oak_planks', 'stick'
  ]) {
    if (contents[item] > 0) toWithdraw[item] = contents[item];
  }
  if (Object.keys(toWithdraw).length > 0) {
    console.log('Withdrawing:', JSON.stringify(toWithdraw));
    await lib.withdraw(toWithdraw, 293, 72, -57);
  }
} catch (err) {
  console.log('Chest interaction note:', err.message);
}

// 4. Equip armor and weapon
await lib.equipArmor();
await lib.equipWeapon();

// 5. Check other players
console.log('Players:');
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`- ${name} at ${lib.fmt(p.entity.position)}`);
}

console.log('Alpha inventory now:', JSON.stringify(lib.inv()));
console.log('Alpha tools:', JSON.stringify(lib.tools()));
