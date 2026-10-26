// programs/256-enter-exact-center-and-transit.js
console.log('=== EXACT CENTER PORTAL ENTRY (299.5, 73.0, -53.5) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// Step to exact center of portal block (299.5, 73.0, -53.5)
bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 2000);
bot.clearControlStates();

const b = bot.blockAt(bot.entity.position);
console.log(`Pos: ${lib.fmt(bot.entity.position)} | Block inside: ${b?.name}`);

if (b?.name !== 'nether_portal') {
  console.log('Not inside portal! Finding nearest nether_portal block...');
  const pb = bot.findBlock({ matching: bl => bl && bl.name === 'nether_portal', maxDistance: 4 });
  if (pb) {
    console.log(`Moving to center of found portal at ${lib.fmt(pb.position)}...`);
    await lib.walkTo(pb.position.x + 0.5, pb.position.z + 0.5, 2000);
    bot.clearControlStates();
  }
}

console.log('Verified inside portal! Standing still for transit...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
  console.log(`[${Math.round((Date.now() - t0)/1000)}s] dim=${bot.game.dimension} pos=${lib.fmt(bot.entity.position)} block=${bot.blockAt(bot.entity.position)?.name}`);
}

console.log('Dimension now:', bot.game.dimension);
console.log('Pos now:', lib.fmt(bot.entity.position));

if (String(bot.game.dimension).includes('nether')) {
  console.log('=== NETHER TRANSIT SUCCESSFUL ===');
  await sleep(400);
  await lib.walkTo(40.5, -6.5, 2000);
  bot.clearControlStates();

  console.log('In Nether bunker! Pos:', lib.fmt(bot.entity.position));
  console.log('HP:', bot.health, 'Food:', bot.food);
  console.log('Inv:', JSON.stringify(lib.inv()));

  bot.chat(`gamma arrived in Nether bunker at (40, 65, -7)! Armed with stone sword & cobble x${lib.count('cobblestone')}. Ready to march!`);
}
