// programs/484-surface-wood-and-stone.js
console.log('=== Step: Surface Wood & Stone Gathering ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Night in:', bot.time.nightIn);

// 1. Pass through door to outside
await lib.goThroughDoor(294, 72, -54, { close: false });
console.log('Outside door at', lib.fmt(bot.entity.position));

// 2. Scan and chop 4 tree logs
const logs = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 20,
  count: 5
});
console.log(`Found ${logs.length} tree logs nearby`);

let chopped = 0;
for (const p of logs) {
  if (isCancelled() || (bot.time.nightIn && bot.time.nightIn < 90)) break;
  try {
    await lib.goTo(p.x, p.y, p.z, 2.5);
    await lib.dig(p.x, p.y, p.z);
    chopped++;
    console.log(`Chopped log at ${lib.fmt(p)} (${chopped}/4)`);
    if (chopped >= 4) break;
  } catch (e) {
    console.log('Chop error:', e.message);
  }
}

// 3. Pick up log drops
await lib.pickup(6);

// 4. Return inside base before night
await lib.goThroughDoor(294, 72, -54, { close: false });
console.log('Back in base at', lib.fmt(bot.entity.position));
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`beta: Surface wood gathered! Inv: ${JSON.stringify(lib.inv())}.`);
