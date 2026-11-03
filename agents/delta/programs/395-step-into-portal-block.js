// programs/395-step-into-portal-block.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Step directly into the purple nether_portal block at (299.5, 73.0, -54.0)
console.log('Walking directly into (299.5, 73.0, -54.0)...');
await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('forward', false);

console.log('Pos inside portal block:', lib.fmt(bot.entity.position));

// 2. Await Nether dimension transition
console.log('Awaiting teleportation...');
const start = Date.now();
while (!isCancelled() && bot.game.dimension !== 'the_nether' && Date.now() - start < 15000) {
  await sleep(400);
}

console.log('Dimension after wait:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
