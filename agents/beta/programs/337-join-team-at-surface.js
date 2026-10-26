// programs/337-join-team-at-surface.js
console.log('=== Step: Climb stairs to base and celebrate Milestone 7 ===');
console.log('Beta pos:', lib.fmt(bot.entity.position));

bot.chat('beta: Milestone 7 portal is lit! Climbing stairs to base to regroup with the team!');

// 1. Walk to base of main stairs at (302, 17, -32)
await bot.lookAt(new Vec3(302, 17, -32));
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1500);
bot.clearControlStates();

console.log('At staircase entrance:', lib.fmt(bot.entity.position));

// 2. Ascend stairs stage by stage
const m = new Movements(bot, mcData);
m.canDig = false;
m.allowParkour = true;
m.allowSprinting = true;
bot.pathfinder.setMovements(m);

try {
  await lib.goTo(302, 35, -38, 2, { timeoutMs: 20000 });
  console.log('Ascended to y=35:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Ascent y=35 note:', e.message);
}

try {
  await lib.goTo(302, 55, -42, 2, { timeoutMs: 25000 });
  console.log('Ascended to y=55:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Ascent y=55 note:', e.message);
}

try {
  await lib.goTo(302, 71, -44, 2, { timeoutMs: 25000 });
  console.log('At surface shaft top!', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Surface top note:', e.message);
}

// 3. Walk to portal and base
try {
  await lib.goTo(298, 72, -52, 2, { timeoutMs: 15000 });
  console.log('Joined team at portal site:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Portal walk note:', e.message);
}

// 4. Verify portal block directly
const p = bot.blockAt(new Vec3(299, 73, -54));
console.log('Portal inner block verification:', p ? p.name : 'null');
if (p?.name === 'nether_portal') {
  bot.chat('beta: Portal block confirmed: nether_portal! Ready for Nether prep!');
}
