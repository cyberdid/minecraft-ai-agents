// programs/366-align-and-step-east.js
console.log('=== Align to z=-41.0 and walk east ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Shift z towards -41.0
bot.setControlState('left', true); // or move towards -41.0
await sleep(150);
bot.clearControlStates();

// 2. Look along z=-41.0 line and jump forward
await bot.lookAt(new Vec3(310, 34, -41.0), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1500);
bot.clearControlStates();

console.log('Pos after east step:', lib.fmt(bot.entity.position));

// Continue along z=-41.0 line
await bot.lookAt(new Vec3(314, 36, -41.0), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(2000);
bot.clearControlStates();

console.log('Final pos:', lib.fmt(bot.entity.position));
