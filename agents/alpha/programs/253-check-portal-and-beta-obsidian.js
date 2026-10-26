// programs/253-check-portal-and-beta-obsidian.js
console.log('=== Program 253: Leave Shelter & Check Obsidian / Portal ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Time:', lib.time());

// 1. Leave shelter
console.log('Leaving shelter...');
try {
  await lib.leaveShelter();
  console.log('Left shelter! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Leave shelter note:', e.message);
  // Manual unseal fallback
  const top = bot.entity.position.floored().offset(0, 2, 0);
  try {
    await lib.dig(top.x, top.y, top.z);
    await lib.goTo(top.x, top.y + 1, top.z, 1, { timeoutMs: 10000 });
  } catch (e2) {}
}

// 2. Check Beta
if (bot.players.beta?.entity) {
  const b = bot.players.beta.entity;
  console.log('Beta pos:', lib.fmt(b.position), 'held:', b.heldItem?.name);
}

bot.chat('beta: Morning! Did you get the 10 obsidian? Meeting at base portal frame (298, 72, -54) to build and ignite!');

// 3. Move along tunnel towards (285, 18, 14) / base
console.log('Moving towards (285, 18, 14)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(285, 18, 14, 3));
} catch (e) {
  console.log('Pathfinder note:', e.message);
}

// 4. Pickup any obsidian drops around
await lib.pickup(8);

// 5. Scan obsidian blocks
const obs = bot.findBlocks({ matching: b => b.name === 'obsidian', maxDistance: 24, count: 20 });
console.log(`Obsidian blocks around: ${obs.length}, in Alpha inventory: ${lib.count('obsidian')}`);

bot.chat(`beta: Obsidian status: Lake has ${obs.length} obsidian blocks. Alpha holds ${lib.count('obsidian')}.`);
console.log('Alpha status:', JSON.stringify(lib.status()));
