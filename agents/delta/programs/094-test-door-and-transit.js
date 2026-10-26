// programs/094-test-door-and-transit.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Go through door
console.log('Passing door at (294, 72, -54)...');
try {
  const res = await lib.goThroughDoor(294, 72, -54);
  console.log('Door result:', res);
} catch (e) {
  console.log('goThroughDoor note:', e.message);
}

console.log('Pos after door:', lib.fmt(bot.entity.position));

// 2. Go to south side of portal (299, 72, -52)
console.log('Navigating to portal approach (299, 72, -52)...');
try {
  await lib.goTo(299, 72, -52);
  console.log('Reached portal approach at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('goTo approach note:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(299, 72, -52, 1));
  } catch (err) {}
}

console.log('At portal approach:', lib.fmt(bot.entity.position));

// 3. Step north into portal frame
const portalBlock = new Vec3(299.5, 73.5, -54.0);
console.log('Stepping into portal block at', lib.fmt(portalBlock));
await bot.lookAt(portalBlock, true);
bot.setControlState('forward', true);
await sleep(1800);
bot.clearControlStates();

console.log('Inside portal frame! Pos:', lib.fmt(bot.entity.position));
bot.chat('delta: In Nether portal frame! Waiting for teleport...');

// 4. Wait for dimension change
const startDim = bot.game.dimension;
for (let i = 0; i < 15; i++) {
  await sleep(1000);
  if (bot.game.dimension !== startDim) {
    console.log(`TELEPORT SUCCESS! Dimension is now: ${bot.game.dimension}`);
    break;
  }
}

console.log('Pos final:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

if (bot.game.dimension.includes('nether')) {
  bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)}!`);
}
