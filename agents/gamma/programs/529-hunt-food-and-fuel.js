// programs/529-hunt-food-and-fuel.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 529: HUNT FOOD & PREPARE FOR NIGHT ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Check furnaces at (295, 72, -54..-56)
for (const z of [-54, -55, -56]) {
  const fPos = new Vec3(295, 72, z);
  const block = bot.blockAt(fPos);
  console.log(`Furnace at ${lib.fmt(fPos)}: ${block?.name}`);
}

// 2. Check animals nearby within 60m
const animals = Object.values(bot.entities).filter(e =>
  ['cow', 'sheep', 'pig', 'chicken'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) <= 60
);
console.log(`Animals nearby within 60m: ${animals.length}`);
for (const a of animals) {
  console.log(`  ${a.name} at ${lib.fmt(a.position)} (dist: ${bot.entity.position.distanceTo(a.position).toFixed(1)}m)`);
}

// 3. Hunt 3 cows or sheep if available
const cows = animals.filter(a => a.name === 'cow');
const sheep = animals.filter(a => a.name === 'sheep');

if (cows.length > 0) {
  bot.chat('gamma: Hunting nearby cows for team food supplies!');
  try {
    await lib.hunt('cow', Math.min(cows.length, 3));
    console.log('Hunt complete! Inventory:', lib.inv());
  } catch (e) {
    console.log('Hunt error:', e.message);
  }
} else if (sheep.length > 0) {
  bot.chat('gamma: Hunting nearby sheep for team food supplies!');
  try {
    await lib.hunt('sheep', Math.min(sheep.length, 3));
    console.log('Hunt complete! Inventory:', lib.inv());
  } catch (e) {
    console.log('Hunt error:', e.message);
  }
}

// 4. Return inside base before night
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(293, 72, -55, 1.5, { timeoutMs: 6000 }); } catch (e2) {}
}

const time = lib.time();
console.log(`Time: night in ${time.secondsUntilNight}s, canSleep: ${time.canSleep}`);

// 5. If night has fallen, sleep in bed
if (time.canSleep) {
  bot.chat('gamma: Night has arrived! Sleeping in bed to skip night!');
  try {
    await lib.sleepInBed();
    console.log('Slept in bed!');
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

return {
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position,
  canSleep: lib.time().canSleep,
  secondsUntilNight: lib.time().secondsUntilNight,
  inv: lib.inv()
};
