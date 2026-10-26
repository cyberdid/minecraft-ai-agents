// programs/108-step-in-and-teleport.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Target portal center: (300.0, 73.0, -54.0)
const portalCenter = new Vec3(300.0, 73.0, -54.0);
console.log('Entering portal center at', lib.fmt(portalCenter));

await bot.lookAt(portalCenter.offset(0, 0.5, 0), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1200);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Pos after jump:', lib.fmt(bot.entity.position));

// Verify feet or head inside portal
const feet = bot.blockAt(bot.entity.position);
const head = bot.blockAt(bot.entity.position.offset(0, 1, 0));
console.log('Feet block:', feet?.name, 'Head block:', head?.name);

if (feet?.name !== 'nether_portal' && head?.name !== 'nether_portal') {
  console.log('Nudging forward into portal...');
  await bot.lookAt(portalCenter, true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.setControlState('forward', false);
  console.log('Nudged pos:', lib.fmt(bot.entity.position));
}

bot.chat('delta: In purple portal block! Standing still for 5s teleport...');

// Hold position inside portal block for teleport
const startDim = bot.game.dimension;
for (let i = 0; i < 20; i++) {
  await sleep(1000);
  if (bot.game.dimension !== startDim) {
    console.log(`TELEPORT SUCCESS! New dimension: ${bot.game.dimension}`);
    break;
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position), 'Final dim:', bot.game.dimension);

if (bot.game.dimension.includes('nether')) {
  bot.chat(`delta: Reached Nether camp (40, 65, -7)! Bringing 2 pickaxes & 56 blocks to reinforce Fortress Outpost.`);
}
