// programs/308-walk-north-into-corridor.js
console.log('Start pos:', lib.fmt(bot.entity.position));

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();
await sleep(200);

// Look North towards (63.3, 65.0, -15)
await bot.lookAt(new Vec3(63.3, 66.0, -15), true);
bot.setControlState('forward', true);
bot.setControlState('sprint', true);

// Hold jump while walking to clear any 0.125-0.5 step differences
bot.setControlState('jump', true);

for (let i = 0; i < 30; i++) {
  await sleep(100);
  console.log(`t=${i*100}ms pos: ${lib.fmt(bot.entity.position)}`);
  if (bot.entity.position.z <= -14.5) {
    console.log('Reached z <= -14.5!');
    break;
  }
}
bot.clearControlStates();
console.log('End pos:', lib.fmt(bot.entity.position));
