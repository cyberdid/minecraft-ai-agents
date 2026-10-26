// programs/278-approach-frontline-and-recover-gear.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(100);

// 1. Advance along enclosed corridor from z=-168 to z=-174
console.log('Advancing along fortified corridor to (44, 65, -174)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -174));
} catch (e) {
  console.log('Corridor move note:', e.message);
  await bot.lookAt(new Vec3(44.5, 65.0, -174.5), true);
  bot.setControlState('forward', true);
  await sleep(1200);
  bot.setControlState('forward', false);
}
console.log('At fortified corridor pos:', lib.fmt(bot.entity.position));

// 2. Pick up dropped items at (39, 65, -176) along cross-bridge
console.log('Moving along cross-bridge to pick up items at (39, 65, -176)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(40, 65, -176, 1));
} catch (e) {
  console.log('Cross-bridge note:', e.message);
}

await lib.pickup(5);
console.log('Items picked up! Inv:', JSON.stringify(lib.inv()));

// 3. Check for food and eat if available
const foodItem = bot.inventory.items().find(i => ['cooked_porkchop', 'cooked_beef', 'bread', 'apple', 'baked_potato', 'cooked_mutton'].includes(i.name));
if (foodItem) {
  console.log('Eating food:', foodItem.name);
  try {
    await bot.equip(foodItem, 'hand');
    await bot.consume();
    console.log('Ate food! New health:', bot.health, 'Food:', bot.food);
  } catch (e) {
    console.log('Eat note:', e.message);
  }
}

// 4. Check for shield and equip in off-hand
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield) {
  console.log('Equipping recovered shield in off-hand!');
  await bot.equip(shield, 'off-hand');
}

// 5. Ensure stone sword in main hand
const sword = bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (sword) {
  await bot.equip(sword, 'hand');
}

console.log('Status after recovery: Health:', bot.health, 'Food:', bot.food, 'Cobble:', lib.count('cobblestone'));
bot.chat(`delta: Fortified bridgehead reached! Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Cobble: ${lib.count('cobblestone')}!`);
