// programs/092-exit-door-and-enter-portal.js
console.log('Pos start:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Move to inside door spot (294, 72, -55)
const doorPos = new Vec3(294, 72, -54);
console.log('Moving to door approach...');
await lib.walkTo(294, -55);
await sleep(300);

// 2. Open door
const door = bot.blockAt(doorPos);
console.log('Door block at (294, 72, -54):', door?.name);
if (door && door.name.includes('door')) {
  await bot.activateBlock(door);
  await sleep(300);
}

// 3. Step outside to (294, 72, -52)
console.log('Stepping outside to (294, 72, -52)...');
await lib.walkTo(294, -52);
await sleep(300);

// Close door behind us
if (door && door.name.includes('door')) {
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(300);
}

console.log('Safely outside at:', lib.fmt(bot.entity.position));

// 4. Walk east around base to in front of portal (299, 72, -52)
console.log('Walking east to (299, 72, -52)...');
await lib.walkTo(299, -52);
await sleep(500);

console.log('In front of portal at:', lib.fmt(bot.entity.position));

// 5. Look north towards portal block (299, 73, -54) and step forward into it
const portalBlock = new Vec3(299.5, 73.5, -54.0);
console.log('Walking north into portal frame at', lib.fmt(portalBlock));
await bot.lookAt(portalBlock, true);
bot.setControlState('forward', true);
await sleep(2500);
bot.setControlState('forward', false);

console.log('Stepped into portal frame! Pos:', lib.fmt(bot.entity.position));
bot.chat('delta: In portal frame, waiting for Nether teleport...');

// 6. Wait for dimension change (up to 15s)
const startDim = bot.game.dimension;
for (let i = 0; i < 15; i++) {
  await sleep(1000);
  if (bot.game.dimension !== startDim) {
    console.log(`TELEPORT SUCCESS! Dimension is now: ${bot.game.dimension}`);
    break;
  }
}

console.log('Pos final:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

if (bot.game.dimension.includes('nether')) {
  bot.chat(`delta: Successfully arrived in the Nether at ${lib.fmt(bot.entity.position)}!`);
}
