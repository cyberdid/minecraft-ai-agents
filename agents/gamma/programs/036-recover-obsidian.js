// programs/036-recover-obsidian.js
bot.chat('gamma scanning shaft and base for Beta drops & obsidian!');

console.log('gamma at:', lib.fmt(bot.entity.position));

// 1. Scan for all dropped items within 32 blocks
const items = Object.values(bot.entities)
  .filter(e => e.name === 'item' || (e.metadata && e.type === 'object'))
  .map(e => ({ id: e.id, pos: lib.fmt(e.position), dist: e.position.distanceTo(bot.entity.position).toFixed(1) }));

console.log(`Found ${items.length} item drops:`, JSON.stringify(items));

// Walk and pick up every drop within 16 blocks
for (const drop of items) {
  try {
    const e = bot.entities[drop.id];
    if (e && e.position) {
      console.log(`Picking up drop at ${lib.fmt(e.position)}...`);
      await lib.goTo(e.position.x, e.position.y, e.position.z, 1, { dig: true });
      await sleep(300);
    }
  } catch (err) {
    console.log('Pickup error:', err.message);
  }
}

await lib.pickup(10);
console.log('Inventory after shaft pickup:', JSON.stringify(lib.inv()));

// 2. Ascend to surface shaft entrance (302, 71, -44)
console.log('Ascending to shaft entrance (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 1, { dig: true });
} catch (e) {
  console.log('Ascend error:', e.message);
}

// 3. Scan surface around portal site (298, 72, -54) and base
console.log('Moving to portal site at (298, 72, -54)...');
try {
  await lib.goTo(298, 72, -53, 1, { dig: true });
  await lib.pickup(10);
} catch (e) {}

console.log('Final inventory:', JSON.stringify(lib.inv()));
bot.chat(`gamma report: obsidian=${lib.count('obsidian')}, flint_and_steel=${lib.count('flint_and_steel')}, inventory=${JSON.stringify(lib.inv())}`);
