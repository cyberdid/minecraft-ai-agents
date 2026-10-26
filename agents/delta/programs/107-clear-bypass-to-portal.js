// programs/107-clear-bypass-to-portal.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Step south to z = -50 (clear of all cobblestone buttresses)
console.log('Walking south to z = -50...');
await lib.walkTo(297, -50);
await sleep(300);
console.log('At clear south line:', lib.fmt(bot.entity.position));

// 2. Walk east to x = 300 along z = -50
console.log('Walking east along z = -50 to x = 300...');
await lib.walkTo(300, -50);
await sleep(300);
console.log('At portal south line:', lib.fmt(bot.entity.position));

// 3. Walk north to portal threshold (300, 72, -53)
console.log('Walking north to portal threshold (300, 72, -53)...');
await lib.walkTo(300, -53);
await sleep(300);
console.log('At portal threshold:', lib.fmt(bot.entity.position));

// 4. Face north directly at portal center (300.0, 73.5, -54.0) and jump forward into it
const portalTarget = new Vec3(300.0, 73.5, -54.0);
console.log('Jumping forward into portal at', lib.fmt(portalTarget));
await bot.lookAt(portalTarget, true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1500);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Position inside portal block:', lib.fmt(bot.entity.position));
bot.chat('delta: Inside purple nether portal block! Teleporting to Nether base camp...');

// 5. Wait for dimension change (up to 15s)
const startDim = bot.game.dimension;
for (let i = 0; i < 15; i++) {
  await sleep(1000);
  if (bot.game.dimension !== startDim) {
    console.log(`TELEPORT SUCCESS! Dimension changed to: ${bot.game.dimension}`);
    break;
  }
}

console.log('Pos final:', lib.fmt(bot.entity.position), 'Dimension final:', bot.game.dimension);

if (bot.game.dimension.includes('nether')) {
  bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)}! Handing spare pickaxe to Beta and advancing.`);
}
