// programs/242-enter-portal-and-transit.js
console.log('=== PRECISE PORTAL ENTRY & NETHER TRANSIT ===');
console.log('Current pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// Target center of portal block (299, 73, -54)
const target = new Vec3(299.5, 73.0, -53.8);
console.log(`Walking into center of portal block at ${lib.fmt(target)}...`);

bot.setControlState('jump', true);
await lib.walkTo(target.x, target.z, 3000);
bot.clearControlStates();

const curBlock = bot.blockAt(bot.entity.position);
console.log(`Standing at ${lib.fmt(bot.entity.position)}, block inside: ${curBlock?.name}`);

if (curBlock?.name !== 'nether_portal') {
  // If not inside, try offset slightly
  console.log('Adjusting position into portal...');
  await lib.walkTo(299.5, -54.0, 2000);
  bot.clearControlStates();
}

console.log('Standing still inside portal for dimension change...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension);
console.log('Pos now:', lib.fmt(bot.entity.position));

if (String(bot.game.dimension).includes('nether')) {
  console.log('SUCCESS: In the Nether!');
  await sleep(500);
  console.log('Stepping out of portal to bunker floor...');
  await lib.walkTo(40.5, -5.0, 3000);
  bot.clearControlStates();
  console.log('Bunker pos:', lib.fmt(bot.entity.position));

  // Scan for our dropped items
  const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 32);
  console.log(`Found ${items.length} items nearby:`);
  for (const it of items) {
    console.log(` - Item entity ${it.id} at ${lib.fmt(it.position)} dist=${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
  }

  bot.chat(`gamma arrived in Nether at ${lib.fmt(bot.entity.position)}! HP: ${bot.health}, Food: ${bot.food}`);
}
