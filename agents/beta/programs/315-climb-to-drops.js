// programs/315-climb-to-drops.js
console.log('=== Ascend from y=-13 to drops at (327, 19, -32) ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

const m = new Movements(bot, mcData);
m.canDig = true;
m.allow1by1towers = true;
m.scaffoldingBlocks = [mcData.itemsByName.cobblestone.id];
bot.pathfinder.setMovements(m);

// Test path to (327, 19, -32)
console.log('Pathfinding to (327, 19, -32)...');
try {
  await lib.goTo(327, 19, -32, 2, { dig: true, timeoutMs: 35000 });
  console.log('Reached drop location! Pos:', lib.fmt(bot.entity.position));
  await lib.pickup(16);
} catch (e) {
  console.log('Direct path note:', e.message);
  // If direct path failed, let's try staged ascent
  console.log('Trying staged ascent to y=5...');
  try {
    await lib.goTo(335, 5, -32, 3, { dig: true, timeoutMs: 20000 });
    console.log('Reached y=5:', lib.fmt(bot.entity.position));
    await lib.goTo(327, 19, -32, 2, { dig: true, timeoutMs: 25000 });
    console.log('Reached drops via stage:', lib.fmt(bot.entity.position));
    await lib.pickup(16);
  } catch (err) {
    console.log('Stage note:', err.message);
  }
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
bot.chat(`beta: At ${lib.fmt(bot.entity.position)}. Pickaxe: ${lib.count('diamond_pickaxe')}, Water: ${lib.count('water_bucket')}`);
