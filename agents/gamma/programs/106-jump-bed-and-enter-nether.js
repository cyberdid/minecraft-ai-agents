// programs/106-jump-bed-and-enter-nether.js
console.log('--- JUMP BED & ENTER NETHER ---');
console.log('Pos before:', lib.fmt(bot.entity.position));

// 1. Jump over bed to (294, 72, -55) in front of door
console.log('Jumping over bed to door entrance (294, 72, -55)...');
await bot.lookAt(new Vec3(294.5, 73, -55.0));
bot.setControlState('jump', true);
bot.setControlState('forward', true);
await sleep(400);
bot.setControlState('jump', false);
bot.setControlState('forward', false);
await sleep(200);

console.log('Pos after jump:', lib.fmt(bot.entity.position));

// 2. Step through base door to exterior (294, 72, -53)
console.log('Stepping through base door (294, 72, -54)...');
await lib.goThroughDoor(294, 72, -54);
console.log('Outside base at:', lib.fmt(bot.entity.position));

// 3. Walk along z=-53 to x=299
console.log('Walking along z=-53 to x=299...');
await lib.walkTo(299, -53);
console.log('In front of portal face at:', lib.fmt(bot.entity.position));

// 4. Step directly into purple portal block at (299, 73, -54)
console.log('Stepping into purple portal block (299, 73, -54)...');
await lib.walkTo(299, -54);

console.log('Waiting for Nether transit...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 30000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within 30s');
}

console.log('SUCCESS! In the Nether at:', lib.fmt(bot.entity.position));
console.log('Dimension:', bot.game.dimension);

// Report in chat
bot.chat(`gamma arrived in the Nether at ${lib.fmt(bot.entity.position)}! Dimension: ${bot.game.dimension}`);
