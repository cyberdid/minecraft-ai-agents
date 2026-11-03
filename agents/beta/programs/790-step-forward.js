// programs/790-step-forward.js
console.log('=== Program 790: Step Forward ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// Let's look towards (63.5, 65.0, -30) and try moving
await bot.lookAt(new Vec3(63.5, 65.5, -30), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1500);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('End pos after manual walk:', lib.fmt(bot.entity.position));
