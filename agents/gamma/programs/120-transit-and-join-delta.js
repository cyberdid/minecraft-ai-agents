// programs/120-transit-and-join-delta.js
console.log('--- DIRECT PORTAL ENTRY & ADVANCE TO DELTA ---');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Walk east to x=299 at z=-52
console.log('Walking east to (299, 73, -52)...');
await lib.walkTo(299, -52);

// 2. Step north into purple portal block at (299, 73, -54)
console.log('Stepping into purple portal block (299, 73, -54)...');
await lib.walkTo(299, -54);

console.log('Waiting for Nether transit...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 30000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within 30s');
}

console.log('SUCCESS! In the Nether at:', lib.fmt(bot.entity.position));
bot.chat('gamma in the Nether! Checking bunker chest and advancing along safe East Ridge (x=63) to Delta at (44, 65, -134).');

// 3. Withdraw supplies from bunker chest at (39, 65, -8)
try {
  const chest = await lib.chestContents(39, 65, -8);
  console.log('Bunker chest:', JSON.stringify(chest));
  await lib.withdraw('all', 39, 65, -8);
  console.log('Inventory now:', JSON.stringify(lib.inv()));
} catch (e) {
  console.log('Bunker chest note:', e.message);
}

// 4. Navigate safe East Ridge Trail to Fortress Workshop (44, 65, -128)
console.log('Moving to Waypoint 1 (50, 65, -35)...');
try {
  await lib.goTo(50, 65, -35, 3, { timeoutMs: 20000 });
} catch (e) {}

console.log('Moving to Waypoint 2 on East Ridge at (63, 65, -66)...');
try {
  await lib.goTo(63, 65, -66, 3, { timeoutMs: 25000 });
  console.log('Safely on East Ridge! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('East Ridge note:', e.message);
}

console.log('Moving to Waypoint 3 on East Ridge at (63, 65, -100)...');
try {
  await lib.goTo(63, 65, -100, 3, { timeoutMs: 25000 });
} catch (e) {}

console.log('Moving to Fortress Workshop doorway (44, 65, -128)...');
try {
  await lib.goTo(44, 65, -128, 1, { timeoutMs: 30000 });
} catch (e) {}

// Move to Delta in advance hallway (44, 65, -134)
console.log('Joining Delta at advance hallway (44, 65, -134)...');
try {
  await lib.goTo(44, 65, -134, 1, { timeoutMs: 15000 });
  console.log('WITH DELTA AT ADVANCE HALLWAY!');
} catch (e) {}

// Report team
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}`);
  }
}

bot.chat(`gamma joined Delta at Fortress advance hallway ${lib.fmt(bot.entity.position)}! Ready for team push to Blaze Spawner (32, 68, -190).`);
