// programs/115-enter-bunker-and-breach-deck.js
console.log('--- ENTER FORTRESS BUNKER & LOCATE SPAWNER ---');
console.log('Pos before:', lib.fmt(bot.entity.position));

// 1. Step cleanly into Fortress Workshop bunker at (44, 65, -129)
console.log('Stepping into Fortress Workshop at (44, 65, -129)...');
try {
  await lib.goTo(44, 65, -129, 1, { timeoutMs: 20000 });
} catch (e) {
  console.log('Bunker enter note:', e.message);
  await lib.goToXZ(44, -129, { timeoutMs: 15000 });
}
console.log('Inside Fortress Workshop! Pos:', lib.fmt(bot.entity.position));

// 2. Advance through Delta fortified hallway to z=-134
console.log('Moving through fortified hallway to (44, 65, -134)...');
try {
  await lib.goTo(44, 65, -134, 1, { timeoutMs: 15000 });
} catch (e) {
  console.log('Hallway advance note:', e.message);
}
console.log('At advance hallway front! Pos:', lib.fmt(bot.entity.position));

// 3. Scan for spawners and blazes towards (32, 68, -190)
console.log('Scanning for spawners within 64m...');
const spawners = bot.findBlocks({
  matching: b => b && b.name === 'spawner',
  maxDistance: 64,
  count: 5
});
console.log(`Spawners detected: ${spawners.length}`);
for (const sp of spawners) {
  console.log(`- SPAWNER AT ${lib.fmt(sp)} (dist: ${sp.distanceTo(bot.entity.position).toFixed(1)}m)`);
}

// Check for Blaze entities
const blazes = Object.values(bot.entities).filter(e => e && e.name === 'blaze' && e.position);
console.log(`Blazes visible: ${blazes.length}`);
for (const b of blazes) {
  console.log(`- BLAZE at ${lib.fmt(b.position)}, dist: ${b.position.distanceTo(bot.entity.position).toFixed(1)}m`);
}

// 4. Check for dropped items nearby (e.g. food/gear from earlier battles)
await lib.pickup(6);
console.log('Gamma inventory now:', JSON.stringify(lib.inv()));

// 5. Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}, dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}m`);
  }
}

bot.chat(`gamma at Fortress advance point ${lib.fmt(bot.entity.position)} with Delta! Spawners found: ${spawners.length}, Blazes: ${blazes.length}.`);
