// programs/095-jump-into-portal.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Jumping into portal at', lib.fmt(portalTarget));

// Face portal target
await bot.lookAt(portalTarget.offset(0, 0.5, 0), true);

// Walk and jump onto portal sill
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1000);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Position after jump:', lib.fmt(bot.entity.position));

// Check if feet are inside portal block
const blockAtFeet = bot.blockAt(bot.entity.position);
const blockAtHead = bot.blockAt(bot.entity.position.offset(0, 1, 0));
console.log('Block at feet:', blockAtFeet?.name, 'Block at head:', blockAtHead?.name);

// If not yet in nether_portal, make fine adjustments
if (blockAtFeet?.name !== 'nether_portal' && blockAtHead?.name !== 'nether_portal') {
  console.log('Adjusting position towards portal center...');
  await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);
  console.log('Adjusted pos:', lib.fmt(bot.entity.position));
}

bot.chat('delta: Inside purple nether portal block! Teleporting to Nether...');

// Wait for dimension change (up to 15s)
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
  bot.chat(`delta: Joined Nether expedition! Pos: ${lib.fmt(bot.entity.position)}. Ready at camp!`);
}
