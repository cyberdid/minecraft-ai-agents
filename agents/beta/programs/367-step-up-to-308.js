// programs/367-step-up-to-308.js
console.log('=== Step straight onto x=308 ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

await bot.lookAt(new Vec3(308.5, 32.5, -40.8), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(800);
bot.clearControlStates();

console.log('After step pos:', lib.fmt(bot.entity.position));

// If reached x=308, step onto x=309 and x=310
if (bot.entity.position.x > 308.0) {
  console.log('Step to x=310...');
  await bot.lookAt(new Vec3(311, 35, -40.8), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(2000);
  bot.clearControlStates();
}

console.log('Final pos:', lib.fmt(bot.entity.position));
