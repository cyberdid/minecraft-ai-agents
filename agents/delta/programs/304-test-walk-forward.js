// programs/304-test-walk-forward.js
console.log('Start pos:', lib.fmt(bot.entity.position));

bot.pathfinder.stop();
await sleep(100);

console.log('Facing North towards z=-15...');
await bot.lookAt(new Vec3(63.5, 65.5, -15), true);
bot.setControlState('forward', true);
bot.setControlState('sprint', true);

for (let i = 0; i < 20; i++) {
  await sleep(100);
  console.log(`t=${i*100}ms pos: ${lib.fmt(bot.entity.position)}`);
  if (bot.entity.position.z <= -14.5) break;
}
bot.clearControlStates();
console.log('End pos:', lib.fmt(bot.entity.position));
