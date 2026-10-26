// programs/247-coordinate-with-beta-retrieval.js
console.log('=== Program 247: Coordinate with Beta Retrieval ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// Step 1: Step into the open passage at (337, 47, -70)
try {
  await lib.walkTo(337, -70);
  console.log('Stepped into passage! Pos:', lib.fmt(bot.entity.position));
} catch (e) {}

// Step 2: Path towards death spot (327, 19, -32)
console.log('Moving towards (327, 19, -32)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(327, 19, -32, 2));
} catch (e) {
  console.log('Pathfinder note:', e.message);
  try {
    await lib.goTo(327, 19, -32, 2, { dig: true, timeoutMs: 25000 });
  } catch (e2) {}
}

// Step 3: Pickup any items
await lib.pickup(10);

// Step 4: Check Beta
if (bot.players.beta?.entity) {
  const b = bot.players.beta.entity;
  console.log('Beta pos:', lib.fmt(b.position), 'held:', b.heldItem?.name);
}

bot.chat(`beta: Alpha pos: ${lib.fmt(bot.entity.position)}. Inventory: ${JSON.stringify(lib.inv())}. Beta status on drops?`);
console.log('Alpha inventory:', JSON.stringify(lib.inv()));
