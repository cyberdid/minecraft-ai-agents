// programs/472-morning-wood-and-gamma.js
console.log('=== Step: Morning Wood Gathering & Link with Gamma ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'Night in:', bot.time.nightIn);

// 1. Pass through door to outside
await lib.goThroughDoor(294, 72, -54, { close: false });
console.log('Outside base at', lib.fmt(bot.entity.position));

// 2. Scan for players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== 'beta') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

// 3. Find and chop nearest tree logs
const logs = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 25,
  count: 6
});
console.log(`Found ${logs.length} tree logs nearby`);

let chopped = 0;
for (const p of logs) {
  if (isCancelled()) break;
  try {
    await lib.goTo(p.x, p.y, p.z, 2.5);
    await lib.dig(p.x, p.y, p.z);
    chopped++;
    console.log(`Chopped log at ${lib.fmt(p)} (${chopped}/5)`);
    if (chopped >= 5) break;
  } catch (e) {
    console.log('Chop error:', e.message);
  }
}

// Pick up any dropped logs
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8
);
for (const d of drops) {
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.5);
  } catch (e) {}
}

// 4. Return to base door
await lib.goThroughDoor(294, 72, -54, { close: false });
console.log('Back in base at', lib.fmt(bot.entity.position));
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`beta: Morning wood gathered! Inv: ${JSON.stringify(lib.inv())}. Ready to craft tools and meet Gamma!`);
