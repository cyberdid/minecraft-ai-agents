// programs/093-walk-to-portal-and-transit.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Inspect door at (294, 72, -54)
const doorBlock = bot.blockAt(new Vec3(294, 72, -54));
console.log('Door block:', doorBlock?.name, 'isOpen:', doorBlock?._properties?.open);

// Ensure door is open
if (doorBlock && doorBlock.name.includes('door') && !doorBlock._properties?.open) {
  console.log('Opening door...');
  await bot.activateBlock(doorBlock);
  await sleep(300);
}

// 2. Step 3 blocks south out into the open yard: (294, 72, -50)
console.log('Walking south to open yard at (294, 72, -50)...');
await bot.lookAt(new Vec3(294.5, 72, -49.0), true);
bot.setControlState('forward', true);
await sleep(2000);
bot.setControlState('forward', false);

console.log('Yard pos:', lib.fmt(bot.entity.position));

// 3. Walk east to (299, 72, -50)
console.log('Walking east to (299, 72, -50)...');
await bot.lookAt(new Vec3(300.0, 72, bot.entity.position.z), true);
bot.setControlState('forward', true);
await sleep(2500);
bot.setControlState('forward', false);

console.log('South of portal pos:', lib.fmt(bot.entity.position));

// 4. Look north at portal block (299.5, 73.5, -54.0) and step forward into it
const target = new Vec3(299.5, 73.5, -54.0);
console.log('Walking north into portal block at', lib.fmt(target));
await bot.lookAt(target, true);
bot.setControlState('forward', true);
await sleep(2500);
bot.setControlState('forward', false);

console.log('Inside portal at:', lib.fmt(bot.entity.position));
bot.chat('delta: Inside Nether portal frame! Transiting now...');

// 5. Wait for dimension change
const startDim = bot.game.dimension;
for (let i = 0; i < 15; i++) {
  await sleep(1000);
  if (bot.game.dimension !== startDim) {
    console.log(`TELEPORT SUCCESS! Dimension: ${bot.game.dimension}`);
    break;
  }
}

console.log('Pos final:', lib.fmt(bot.entity.position), 'dim final:', bot.game.dimension);

if (bot.game.dimension.includes('nether')) {
  bot.chat(`delta: Successfully arrived in the Nether at ${lib.fmt(bot.entity.position)}! Joining Alpha and Beta.`);
}
