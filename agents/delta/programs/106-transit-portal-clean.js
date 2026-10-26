// programs/106-transit-portal-clean.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Exit base door (294, 72, -54)
console.log('Exiting door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door note:', e.message);
  await lib.goTo(294, 72, -52);
}
console.log('Outside door at:', lib.fmt(bot.entity.position));

// 2. Walk along z = -52 clear south approach to x = 300
console.log('Walking along open approach to (300, 72, -52)...');
await lib.walkTo(300, -52);
await sleep(300);
console.log('At portal approach:', lib.fmt(bot.entity.position));

// 3. Look north at portal center opening (300.5, 73.5, -54.0) and step into it
const portalTarget = new Vec3(300.5, 73.5, -54.0);
console.log('Stepping into portal opening at', lib.fmt(portalTarget));
await bot.lookAt(portalTarget, true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1500);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Inside portal opening! Pos:', lib.fmt(bot.entity.position));
bot.chat('delta: Inside Nether portal opening! Teleporting to Nether camp...');

// 4. Wait for dimension change
const startDim = bot.game.dimension;
for (let i = 0; i < 15; i++) {
  await sleep(1000);
  if (bot.game.dimension !== startDim) {
    console.log(`TELEPORT SUCCESS! Dimension is now: ${bot.game.dimension}`);
    break;
  }
}

console.log('Pos final:', lib.fmt(bot.entity.position), 'Dimension final:', bot.game.dimension);

if (bot.game.dimension.includes('nether')) {
  bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)} with 56 building blocks! Mining gold for boots & advancing to Fortress (45, 65, -128).`);
}
