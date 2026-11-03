bot.clearControlStates();
bot.setControlState('jump', true);
bot.setControlState('forward', true);
// Look slightly up towards +x, +z (shore)
await bot.lookAt(new Vec3(bot.entity.position.x + 10, 65, bot.entity.position.z + 10), true);

for (let i = 0; i < 15; i++) {
  await sleep(500);
  console.log(`Swimming up! pos: ${lib.fmt(bot.entity.position)}, health: ${bot.health}`);
  if (bot.entity.position.y >= 62) {
    console.log('SURFACE REACHED!');
    break;
  }
}
bot.clearControlStates();
