// programs/464-gather-wood-and-food.js
console.log('=== Step: Gather Wood & Food near Base ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Night in:', bot.time.nightIn);

// 1. Pass through door to outside
await lib.goThroughDoor(294, 72, -54, { close: false });
console.log('Outside door at', lib.fmt(bot.entity.position));

// 2. Scan for nearby tree logs
const logs = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 20,
  count: 6
});
console.log(`Found ${logs.length} tree logs nearby`);

// Chop 4-5 logs
let chopped = 0;
for (const p of logs) {
  if (isCancelled() || (bot.time.nightIn && bot.time.nightIn < 120)) break;
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

// 3. Scan for nearby food animals
const animals = Object.values(bot.entities).filter(e => 
  ['cow', 'sheep', 'pig', 'chicken'].includes(e.name) && 
  bot.entity.position.distanceTo(e.position) < 25
);
console.log(`Found ${animals.length} animals nearby`);

for (const a of animals) {
  if (isCancelled() || (bot.time.nightIn && bot.time.nightIn < 100)) break;
  try {
    console.log(`Hunting ${a.name} at ${lib.fmt(a.position)}...`);
    await lib.kill(a);
    console.log(`Defeated ${a.name}!`);
    await sleep(400);
  } catch (e) {
    console.log(`Hunt error on ${a.name}:`, e.message);
  }
}

// 4. Collect all drops nearby
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 10
);
for (const d of drops) {
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.6);
  } catch (e) {}
}

// 5. Return inside base before night
console.log('Returning to base...');
await lib.goThroughDoor(294, 72, -54, { close: false });
console.log('Safely inside base at', lib.fmt(bot.entity.position));
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`beta: Gathered supplies! Inv: ${JSON.stringify(lib.inv())}. Preparing tools and cooking food.`);
