// programs/159-cycle-portal-and-transit.js
console.log('--- CYCLE OUT OF PORTAL TO RESET COOLDOWN, THEN TRANSIT ---');
console.log('Initial pos:', bot.entity.position);

// 1. Check surrounding blocks to find where to step out
for (let dz of [-2, -1, 1, 2]) {
  const b = bot.blockAt(bot.entity.position.offset(0, 0, dz));
  console.log(`Offset z=${dz}: ${b?.name} at ${b?.position}`);
}

// Step out to z = -5 (or wherever is open)
console.log('Stepping out of portal to (40.5, 65, -5.0)...');
await lib.walkTo(40.5, -5.0, 3000);
console.log('Pos after stepping out:', bot.entity.position);
const outBlock = bot.blockAt(bot.entity.position);
console.log('Block standing in after stepping out:', outBlock?.name);

// Wait 2 seconds for portal cooldown to clear
console.log('Waiting 2 seconds for portal cooldown to reset...');
await sleep(2000);

// Step back into portal block (40.5, 65, -6.5)
console.log('Stepping back into portal at (40.5, 65, -6.5)...');
await lib.walkTo(40.5, -6.5, 3000);
bot.clearControlStates();
console.log('Inside portal again! Pos:', bot.entity.position);

// Wait for dimension change (Overworld)
console.log('Standing still waiting for transit to Overworld...');
const t0 = Date.now();
while (String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 30000) && !isCancelled()) {
  await sleep(1000);
  console.log(`Waiting... dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}`);
}

if (!String(bot.game.dimension).includes('nether')) {
  console.log('TRANSIT SUCCESS! Dimension is now:', bot.game.dimension);
  console.log('Pos:', lib.fmt(bot.entity.position));
  bot.chat(`gamma returned to Overworld at ${lib.fmt(bot.entity.position)}! Re-arming at base.`);
} else {
  console.log('Did not transit yet. Current dim:', bot.game.dimension);
}
