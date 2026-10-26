// programs/278-assist-alpha-at-lava-pool.js
console.log('=== Step 36: Assist Alpha at surface lava pool (333, 62, -78) ===');

// 1. Walk towards lava pool area (328, 64, -74)
console.log('Walking towards lava pool...');
try {
  await lib.goToXZ(328, -74, { timeoutMs: 20000 });
} catch (e) {
  console.log('Walk to lava pool note:', e.message);
}

console.log('Near lava pool. Beta at:', lib.fmt(bot.entity.position));

// 2. Scan for obsidian and lava blocks
const obsBlocks = bot.findBlocks({
  matching: b => b && b.name === 'obsidian',
  maxDistance: 16,
  count: 30
});
console.log(`Found ${obsBlocks.length} obsidian blocks at pool!`, obsBlocks.map(p => lib.fmt(p)));

const lavaBlocks = bot.findBlocks({
  matching: b => b && b.name === 'lava',
  maxDistance: 16,
  count: 30
});
console.log(`Found ${lavaBlocks.length} lava blocks at pool.`);

// 3. Scan for item drops (obsidian drops)
await lib.pickup(10);

// 4. Check Alpha
const alpha = bot.players['alpha']?.entity;
if (alpha) {
  console.log('Alpha at:', lib.fmt(alpha.position), 'held:', alpha.heldItem?.name);
}

// 5. If obsidian blocks exist, can Alpha or Beta mine them?
console.log(`Current obsidian on Beta: ${lib.count('obsidian')}`);

// 6. Return to base before night
console.log('Returning to base at (294, 72, -54)...');
try {
  await lib.goToXZ(294, -54, { timeoutMs: 25000 });
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base safely!');
} catch (e) {
  console.log('Return error:', e.message);
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Lava pool status: ${obsBlocks.length} obsidian blocks formed, ${lavaBlocks.length} lava remaining. Obsidian on beta: ${lib.count('obsidian')}.`);
