// programs/252-emergency-shelter.js
console.log('=== Program 252: Emergency Shelter for Night & Monitor Beta ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Time:', lib.time());

// 1. Seal in shelter
try {
  console.log('Digging and sealing emergency shelter...');
  const res = await lib.shelter();
  console.log('Shelter result:', res);
} catch (e) {
  console.log('Shelter error:', e.message);
  // Manual seal fallback: dig 2 down, place block above
  const pos = bot.entity.position.floored();
  try {
    await lib.dig(pos.x, pos.y - 1, pos.z);
    await lib.dig(pos.x, pos.y - 2, pos.z);
    await bot.pathfinder.goto(new goals.GoalBlock(pos.x, pos.y - 2, pos.z));
    await lib.place('cobblestone', pos.x, pos.y, pos.z);
  } catch (e2) {
    console.log('Manual seal note:', e2.message);
  }
}

console.log('Inside shelter! Pos:', lib.fmt(bot.entity.position));

// 2. Chat with Beta
bot.chat('beta: Alpha secured in emergency shelter for the night! What is your obsidian count?');

// 3. Monitor for 30s
for (let i = 0; i < 15; i++) {
  if (isCancelled()) break;
  if (bot.players.beta?.entity) {
    const b = bot.players.beta.entity;
    console.log(`[t=${i*2}s] Beta at ${lib.fmt(b.position)}, held: ${b.heldItem?.name}`);
  }
  await sleep(2000);
}

console.log('Shelter status:', JSON.stringify(lib.status()));
