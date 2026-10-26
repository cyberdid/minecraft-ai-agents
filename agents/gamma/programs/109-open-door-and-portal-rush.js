// programs/109-open-door-and-portal-rush.js
console.log('--- OPEN DOOR & PORTAL RUSH ---');
console.log('Pos before:', lib.fmt(bot.entity.position));

// 1. Right-click door at (294, 72, -54) to ensure it is open
const door = bot.blockAt(new Vec3(294, 72, -54));
if (door && door.name.includes('door')) {
  console.log('Activating door at (294, 72, -54)...');
  try {
    await bot.activateBlock(door);
    console.log('Door activated!');
  } catch (e) {
    console.log('Door activate note:', e.message);
  }
}

// 2. Jump forward through doorway to (294, 72, -53)
console.log('Jumping forward through doorway...');
await bot.lookAt(new Vec3(294.0, 72.0, -52.0));
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(600);
bot.setControlState('jump', false);
bot.setControlState('forward', false);
await sleep(200);

console.log('Pos after doorway jump:', lib.fmt(bot.entity.position));

// 3. Walk to portal face at (299, 73, -53)
console.log('Walking east along z=-53 to portal face (299, 73, -53)...');
try {
  await lib.walkTo(299, -53);
} catch (e) {
  await bot.pathfinder.goto(new goals.GoalNear(299, 73, -53, 1));
}
console.log('At portal face! Pos:', lib.fmt(bot.entity.position));

// 4. Step directly into purple portal block at (299, 73, -54)
console.log('Stepping into purple portal block (299, 73, -54)...');
await bot.lookAt(new Vec3(299.5, 73.5, -54.0));
bot.setControlState('forward', true);
await sleep(500);
bot.setControlState('forward', false);

console.log('Waiting for Nether transit...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 30000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  console.log('Transit note: Still in', bot.game.dimension, 'at', lib.fmt(bot.entity.position));
} else {
  console.log('SUCCESS! In the Nether at:', lib.fmt(bot.entity.position));
  bot.chat(`gamma arrived in the Nether at ${lib.fmt(bot.entity.position)}! Dimension: ${bot.game.dimension}`);
}
