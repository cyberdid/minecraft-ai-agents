// programs/532-fix-nan-position.js
console.log('Pos before:', bot.entity.position);

bot.clearControlStates();
bot.entity.velocity.set(0, 0, 0);

// If NaN, restore to last known valid coordinates (305.5, 68.0, -64.5)
if (isNaN(bot.entity.position.x) || isNaN(bot.entity.position.z)) {
  console.log('Restoring valid coordinates...');
  bot.entity.position.x = 305.5;
  bot.entity.position.y = 68.0;
  bot.entity.position.z = -64.5;
}

// Reset yaw and pitch to 0
bot.entity.yaw = 0;
bot.entity.pitch = 0;

await sleep(500);
console.log('Pos after reset:', bot.entity.position);
