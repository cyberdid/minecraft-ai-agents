// programs/102-approach-portal-from-south.js
console.log('--- ENTERING PORTAL FROM SOUTH APPROACH ---');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Move south to z=-51
console.log('Moving south to clear wall at (295, 73, -51)...');
await lib.walkTo(295, -51);
console.log('At pos:', lib.fmt(bot.entity.position));

// 2. Move east to x=299 at z=-51
console.log('Moving east to (299, 73, -51)...');
await lib.walkTo(299, -51);
console.log('At pos:', lib.fmt(bot.entity.position));

// 3. Move north to portal face (299, 73, -53)
console.log('Moving north to portal face at (299, 73, -53)...');
await lib.walkTo(299, -53);
console.log('At pos:', lib.fmt(bot.entity.position));

// 4. Step directly into purple portal block at (299, 73, -54)
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

console.log('SUCCESS! Arrived in the Nether!');
console.log('Dimension:', bot.game.dimension);
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// Check bunker chest
try {
  const chest = await lib.chestContents(39, 65, -8);
  console.log('Bunker chest:', JSON.stringify(chest));
  await lib.withdraw('all', 39, 65, -8);
  console.log('Withdrew all from bunker chest. Inv:', JSON.stringify(lib.inv()));
} catch (e) {
  console.log('Bunker chest note:', e.message);
}

bot.chat(`gamma arrived in the Nether at ${lib.fmt(bot.entity.position)}! Advancing along East Ridge to Fortress Workshop.`);
