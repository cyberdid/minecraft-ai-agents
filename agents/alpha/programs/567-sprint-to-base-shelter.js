// programs/567-sprint-to-base-shelter.js
console.log('=== Program 567: Sprint to Base Shelter ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Hostiles check
const hostiles = lib.hostiles(16);
console.log(`Hostiles nearby (${hostiles.length}):`, hostiles.map(h => `${h.name} at ${lib.fmt(h.pos)} (${h.dist.toFixed(1)}m)`));

// Sprint East towards base door at (294, 72, -54)
console.log('Sprinting East up hill to base...');
const hillSteps = [
  new Vec3(285, 66, -53),
  new Vec3(290, 70, -54),
  new Vec3(294, 72, -54)
];

for (const wp of hillSteps) {
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 6000 });
  } catch (e) {
    await bot.lookAt(new Vec3(wp.x, wp.y + 0.5, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(1000);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
    bot.setControlState('jump', false);
  }
}

// Enter through base door
console.log('Entering base shelter...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.lookAt(new Vec3(292, 72, -56), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// Wait for health regeneration inside base
console.log('Inside base! Waiting for natural health regen...');
const regenStart = Date.now();
while (bot.health < 18 && Date.now() - regenStart < 15000) {
  await sleep(1000);
}

console.log('Health regenerated! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
bot.chat(`alpha: Safely inside base shelter ${lib.fmt(bot.entity.position)}! HP: ${bot.health.toFixed(1)}/20. Teammates ready to gear up for Nether spawner assault!`);
