// programs/249-hold-portal-transit.js
console.log('=== HOLD PORTAL TRANSIT ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Offhand:', bot.entity.equipment[1]?.name);
console.log('Cobblestone:', lib.count('cobblestone'));

// Center into portal block
bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.8, 2000);
bot.clearControlStates();

console.log('Centered in portal block! Pos:', lib.fmt(bot.entity.position), 'Block:', bot.blockAt(bot.entity.position)?.name);
console.log('Standing still for Nether transit...');

const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000)) {
  await sleep(500);
  if (Math.round((Date.now() - t0) / 1000) % 3 === 0) {
    console.log(`Waiting... dim=${bot.game.dimension} pos=${lib.fmt(bot.entity.position)}`);
  }
}

console.log('Final dimension:', bot.game.dimension);
console.log('Final pos:', lib.fmt(bot.entity.position));

if (String(bot.game.dimension).includes('nether')) {
  console.log('=== NETHER ARRIVAL SUCCESSFUL ===');
  await sleep(500);
  console.log('Stepping out of portal to bunker floor...');
  await lib.walkTo(40.5, -5.0, 3000);
  bot.clearControlStates();

  console.log('Bunker pos:', lib.fmt(bot.entity.position));
  console.log('HP:', bot.health, 'Food:', bot.food);
  console.log('Offhand:', bot.entity.equipment[1]?.name);
  console.log('Tools:', JSON.stringify(lib.tools()));
  console.log('Inv:', JSON.stringify(lib.inv()));

  bot.chat(`gamma arrived in Nether with SHIELD in offhand and ${lib.count('cobblestone')} cobble! Advancing to Spawner!`);
} else {
  console.log('Still in overworld!');
}
