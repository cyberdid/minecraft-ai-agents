// programs/310-clear-ceiling-and-sprint.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// 1. Dig ceiling blocks at y=67 from z=-6 to z=-12 to give 3-block clearance
console.log('Clearing ceiling at y=67 for full head clearance...');
for (let z = -6; z >= -12; z--) {
  const b = bot.blockAt(new Vec3(63, 67, z));
  if (b && b.name !== 'air' && b.name !== 'cave_air') {
    try {
      await bot.dig(b);
      console.log(`Cleared ceiling at (63, 67, ${z}): ${b.name}`);
    } catch (e) {
      console.log(`Note clearing (63, 67, ${z}):`, e.message);
    }
  }
}

// Also check z=-8 floor if needed
console.log('Checking movement after clearance...');
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// Step forward past z=-8
await bot.lookAt(new Vec3(63.0, 66.0, -15), true);
bot.setControlState('forward', true);
bot.setControlState('sprint', true);
bot.setControlState('jump', true);
await sleep(400);
bot.setControlState('jump', false);

for (let i = 0; i < 25; i++) {
  await sleep(100);
  if (bot.entity.position.z <= -14) {
    console.log(`Successfully reached pos: ${lib.fmt(bot.entity.position)}!`);
    break;
  }
}
bot.clearControlStates();
console.log('Pos after forward sprint:', lib.fmt(bot.entity.position));
