// programs/364-walk-up-east-ramp.js
console.log('=== Walk up east ramp holding forward + jump ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

await bot.lookAt(new Vec3(315, bot.entity.position.y + 4, -41.5), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(3500);
bot.clearControlStates();

console.log('After walk pos:', lib.fmt(bot.entity.position));
