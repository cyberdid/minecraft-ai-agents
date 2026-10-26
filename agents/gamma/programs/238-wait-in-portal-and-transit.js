// programs/238-wait-in-portal-and-transit.js
console.log('=== WAIT IN PORTAL FOR TRANSIT ===');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Start dim:', JSON.stringify(bot.game.dimension));

// Ensure controls are cleared
bot.clearControlStates();

const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 30000)) {
  await sleep(1000);
  console.log(`[${Math.round((Date.now() - t0)/1000)}s] Waiting in portal... pos=${lib.fmt(bot.entity.position)} dim=${JSON.stringify(bot.game.dimension)}`);
}

console.log('Final dimension:', JSON.stringify(bot.game.dimension));
console.log('Final pos:', lib.fmt(bot.entity.position));

if (String(bot.game.dimension).includes('nether')) {
  console.log('Successfully in the Nether!');
  await sleep(500);
  console.log('Stepping out of portal hitbox to (40.5, 65.0, -5.0)...');
  await lib.walkTo(40.5, -5.0, 3000);
  bot.clearControlStates();
  console.log('Bunker pos:', lib.fmt(bot.entity.position));
  console.log('Inv:', JSON.stringify(lib.inv()));
  bot.chat(`gamma arrived in Nether at (40, 65, -5)! 38 cobble & stone gear ready to bridge to spawner!`);
} else {
  console.log('Did not transit. Trying step back and forward...');
  // Maybe step out and back in
  await lib.walkTo(299.5, -52.0, 2000);
  await sleep(500);
  bot.setControlState('jump', true);
  await lib.walkTo(299.5, -53.5, 2000);
  bot.clearControlStates();
}
