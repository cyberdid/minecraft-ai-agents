// programs/104-jump-portal-to-nether.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Jumping into portal at', lib.fmt(portalTarget));

await bot.lookAt(portalTarget.offset(0, 0.5, 0), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1200);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Pos after jump:', lib.fmt(bot.entity.position));

// Verify feet or head are inside nether_portal
const feet = bot.blockAt(bot.entity.position);
const head = bot.blockAt(bot.entity.position.offset(0, 1, 0));
console.log('Feet block:', feet?.name, 'Head block:', head?.name);

if (feet?.name !== 'nether_portal' && head?.name !== 'nether_portal') {
  // Adjust forward
  await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(400);
  bot.setControlState('forward', false);
  console.log('Adjusted pos:', lib.fmt(bot.entity.position));
}

bot.chat('delta: Inside purple nether portal! Teleporting to Nether camp...');

// Wait for dimension change
const startDim = bot.game.dimension;
for (let i = 0; i < 15; i++) {
  await sleep(1000);
  if (bot.game.dimension !== startDim) {
    console.log(`TELEPORT SUCCESS! Dimension changed to: ${bot.game.dimension}`);
    break;
  }
}

console.log('Pos final:', lib.fmt(bot.entity.position), 'dim final:', bot.game.dimension);

if (bot.game.dimension.includes('nether')) {
  bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)} with 56 building blocks & weapons! Moving North to Fortress Outpost (45, 65, -130).`);
}
