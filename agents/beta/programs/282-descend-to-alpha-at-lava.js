// programs/282-descend-to-alpha-at-lava.js
console.log('=== Step 40: Descend to Alpha at (313, 14, -59) to assist with obsidian ===');

// 1. Exit base
console.log('Exiting base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  await lib.goTo(294, 72, -52, 1);
}

// 2. Walk to shaft entrance (302, 71, -44)
console.log('Walking to shaft entrance (302, 71, -44)...');
await lib.goTo(302, 71, -44, 1, { timeoutMs: 15000 });

// 3. Navigate down towards Alpha at (313, 14, -59)
console.log('Descending shaft towards Alpha at y=14...');
try {
  await lib.goTo(313, 15, -59, 4, { timeoutMs: 35000, dig: true });
  console.log('Reached lower level! Beta pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Descent note:', e.message);
}

// 4. Place a torch if dark
try {
  await lib.placeTorch();
} catch (e) {}

// 5. Check Alpha entity
const alpha = bot.players['alpha']?.entity;
if (alpha) {
  console.log(`Alpha is at: ${lib.fmt(alpha.position)}, dist: ${alpha.position.distanceTo(bot.entity.position).toFixed(1)}`);
  if (alpha.heldItem) console.log('Alpha held item:', alpha.heldItem.name);
}

// 6. Scan for obsidian and lava blocks
const obsBlocks = bot.findBlocks({
  matching: b => b && b.name === 'obsidian',
  maxDistance: 16,
  count: 20
});
console.log(`Found ${obsBlocks.length} obsidian blocks at y=14:`, obsBlocks.map(p => lib.fmt(p)));

const lavaBlocks = bot.findBlocks({
  matching: b => b && b.name === 'lava',
  maxDistance: 16,
  count: 20
});
console.log(`Found ${lavaBlocks.length} lava blocks nearby.`);

// 7. Pick up any item drops
await lib.pickup(10);
console.log(`Current obsidian in Beta inventory: ${lib.count('obsidian')}`);

// 8. If Beta holds 10 obsidian already, ascend to surface!
if (lib.count('obsidian') >= 10) {
  console.log('We have 10 obsidian! Ascending to surface base...');
  try {
    await lib.goTo(302, 71, -44, 2, { timeoutMs: 35000, dig: true });
    await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
    await lib.goThroughDoor(294, 72, -54);
    console.log('Inside base with 10 obsidian!');
  } catch (e) {}
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Beta tools now:', JSON.stringify(lib.tools()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: At y=14. Obsidian blocks in sight: ${obsBlocks.length}, obsidian in inv: ${lib.count('obsidian')}/10.`);
