// programs/211-ascend-to-surface.js
console.log('=== Program 211: Ascend from y=-1 to Surface ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// Try staging towards the descent entrance at (345, 65, -40)
const stages = [
  { x: 315, y: 15, z: -60 },
  { x: 325, y: 32, z: -55 },
  { x: 335, y: 50, z: -48 },
  { x: 345, y: 65, z: -40 }
];

// Let's see if pathfinder can follow the stairs back
for (let i = 0; i < stages.length; i++) {
  if (isCancelled()) break;
  const target = stages[i];
  console.log(`Ascending to stage ${i + 1}/${stages.length}: target ~(${target.x}, ${target.y}, ${target.z})...`);
  try {
    // GoalNear with vertical tolerance or GoalComposite
    await bot.pathfinder.goto(new goals.GoalNear(target.x, target.y, target.z, 3));
    console.log(`Reached stage ${i + 1}! Pos:`, lib.fmt(bot.entity.position));
  } catch (err) {
    console.log(`Pathfinder to stage ${i + 1} (${target.x}, ${target.y}, ${target.z}) notice:`, err.message);
    // If strict GoalNear fails, try with dig: true via lib.goTo
    try {
      console.log('Retrying stage with lib.goTo dig: true...');
      await lib.goTo(target.x, target.y, target.z, 3, { dig: true, timeoutMs: 20000 });
      console.log('Stage completed with lib.goTo! Pos:', lib.fmt(bot.entity.position));
    } catch (err2) {
      console.log('lib.goTo fallback error:', err2.message, 'Current pos:', lib.fmt(bot.entity.position));
      // If we made good vertical progress, keep going
    }
  }
}

console.log('After ascent attempts, current pos:', lib.fmt(bot.entity.position));

// If we are near surface (y >= 60), navigate towards base (294, 72, -54)
if (bot.entity.position.y >= 55) {
  console.log('On/near surface! Heading to base entrance (294, 72, -52)...');
  try {
    await lib.goTo(294, 72, -52, 2, { timeoutMs: 30000 });
    console.log('Arrived outside base! Pos:', lib.fmt(bot.entity.position));
  } catch (err) {
    console.log('Travel to base note:', err.message);
  }
}
