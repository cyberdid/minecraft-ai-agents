// programs/369-run-up-and-jump.js
console.log('=== Step back 1m, then sprint-jump onto x=308 ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Back up 1m along -X to get a run-up
await bot.lookAt(new Vec3(310, 31, -41.0), true);
bot.setControlState('back', true);
await sleep(400);
bot.clearControlStates();
console.log('Backed up pos:', lib.fmt(bot.entity.position));

// 2. Sprint forward and jump onto x=308
await bot.lookAt(new Vec3(310, 33, -41.0), true);
bot.setControlState('sprint', true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1000);
bot.clearControlStates();
console.log('Jump pos:', lib.fmt(bot.entity.position));

// 3. If reached y=32, continue sprinting along the ramp!
if (bot.entity.position.y >= 31.8) {
  console.log('Successfully landed on step! Continuing up the ramp...');
  await bot.lookAt(new Vec3(315, 36, -41.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(2500);
  bot.clearControlStates();
}

console.log('Final pos:', lib.fmt(bot.entity.position));
