// programs/254-exit-door-and-transit.js
console.log('=== EXIT DOOR & PRECISE NETHER TRANSIT ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Step through base door to outside
console.log('Stepping through base door to outside...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('goThroughDoor note:', e.message);
  try { await lib.walkTo(294.5, -52.5, 3000); } catch (e2) {}
}
bot.clearControlStates();
console.log('Outside base! Pos:', lib.fmt(bot.entity.position));

// 2. Walk to portal approach at (299, 72, -52)
console.log('Walking to portal approach at (299, 72, -52)...');
await lib.goTo(299, 72, -52, 1, { timeoutMs: 10000 });
console.log('At portal approach! Pos:', lib.fmt(bot.entity.position));

// 3. Step up onto obsidian sill and center in portal block (299.5, 73.0, -54.0)
console.log('Stepping up into portal block...');
bot.setControlState('jump', true);
await lib.walkTo(299.5, -54.0, 3000);
bot.clearControlStates();

const curBlock = bot.blockAt(bot.entity.position);
console.log(`Standing at ${lib.fmt(bot.entity.position)}, block: ${curBlock?.name}`);

// 4. Stand still for dimension transit (up to 20s)
console.log('Standing still for Nether transit...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 20000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension);
console.log('Pos now:', lib.fmt(bot.entity.position));

if (String(bot.game.dimension).includes('nether')) {
  console.log('=== TRANSIT SUCCESSFUL ===');
  await sleep(400);
  // Step out to bunker floor
  await lib.walkTo(40.5, -5.0, 3000);
  bot.clearControlStates();

  console.log('Nether bunker pos:', lib.fmt(bot.entity.position));
  console.log('HP:', bot.health, 'Food:', bot.food);
  console.log('Inv:', JSON.stringify(lib.inv()));
  console.log('Gear:', JSON.stringify(lib.tools()));

  bot.chat(`gamma arrived in Nether at ${lib.fmt(bot.entity.position)}! Stone sword equipped, cobble x${lib.count('cobblestone')}. Marching to Spawner front!`);
} else {
  console.log('Still in overworld. Pos:', lib.fmt(bot.entity.position));
}
