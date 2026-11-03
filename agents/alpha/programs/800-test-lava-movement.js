// programs/800-test-lava-movement.js
console.log('Start pos:', lib.fmt(bot.entity.position), 'isInLava:', bot.entity.isInLava);

// Look South towards z = -6
await bot.lookAt(new Vec3(52, 32, -6), true);

bot.setControlState('forward', true);
bot.setControlState('jump', true); // swim on surface

const start = Date.now();
while (Date.now() - start < 4000) {
  await sleep(100);
}

bot.clearControlStates();
console.log('End pos:', lib.fmt(bot.entity.position), 'moved distance:', bot.entity.position.distanceTo(new Vec3(52.4, 31.3, -116.3)).toFixed(1));
