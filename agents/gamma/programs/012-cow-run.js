// programs/012-cow-run.js
bot.chat('gamma running North to hunt cow for food, returning before nightfall');

console.log('Heading towards cow at (303, 64, 26)...');
const targetPos = new Vec3(303, 64, 26);
try {
  await lib.goTo(targetPos.x, targetPos.y, targetPos.z, 3, { dig: true });
} catch (e) {
  console.log('Pathfind error heading North:', e.message);
}

console.log('Reached', lib.fmt(bot.entity.position));

// Hunt cow or any nearby animal
const animal = bot.nearestEntity(e => ['cow', 'sheep', 'pig'].includes(e.name) && e.position.distanceTo(bot.entity.position) < 24);
if (animal) {
  console.log(`Found ${animal.name} at ${lib.fmt(animal.position)}`);
  await lib.equipWeapon();
  const aid = animal.id;
  const deadline = Date.now() + 10000;
  while (bot.entities[aid] && Date.now() < deadline && !isCancelled()) {
    await bot.lookAt(animal.position.offset(0, animal.height * 0.5, 0));
    bot.attack(animal);
    await sleep(600);
  }
  await sleep(400);
  await lib.pickup(8);
  console.log('Killed! Inventory now:', JSON.stringify(lib.inv()));
} else {
  console.log('No animal found at destination');
}

console.log('Returning to base at (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
  console.log('At base door. Stepping inside...');
  await lib.door(294, 72, -54, true);
  await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -55));
  await lib.door(294, 72, -54, false);
} catch (e) {
  console.log('Return error:', e.message);
}

console.log('Inside base. Final inventory:', JSON.stringify(lib.inv()));
console.log('Time until night:', lib.time().secondsUntilNight);
bot.chat(`gamma back at base with food! night in: ${lib.time().secondsUntilNight}s`);
