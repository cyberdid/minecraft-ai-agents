// programs/005-hunt.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

const animalsToHunt = ['cow', 'sheep', 'pig'];
const nearby = Object.values(bot.entities)
  .filter(e => e.name && animalsToHunt.includes(e.name) && e.position)
  .map(e => ({ name: e.name, pos: lib.fmt(e.position), dist: e.position.distanceTo(bot.entity.position).toFixed(1) }));

console.log('Nearby animals:', JSON.stringify(nearby));

// If no animals within 30 blocks, walk 20 blocks towards north (z: -15)
if (!nearby.some(a => parseFloat(a.dist) < 30)) {
  console.log('Stepping North to z = -15...');
  await lib.goTo(302, 72, -15, 2);
}

// Hunt up to 4 animals
let killed = 0;
for (let step = 0; step < 5; step++) {
  if (isCancelled() || lib.time().secondsUntilNight < 120) break;

  const targets = Object.values(bot.entities)
    .filter(e => e.name && animalsToHunt.includes(e.name) && e.position && e.position.distanceTo(bot.entity.position) < 40)
    .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

  if (targets.length === 0) break;
  const target = targets[0];
  console.log(`Targeting ${target.name} at ${lib.fmt(target.position)}`);
  await lib.equipWeapon();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(target.position.x, target.position.y, target.position.z, 2));
  } catch (err) {
    console.log('Goto target failed:', err.message);
    continue;
  }

  const tid = target.id;
  const limit = Date.now() + 10000;
  while (bot.entities[tid] && Date.now() < limit && !isCancelled()) {
    await bot.lookAt(target.position.offset(0, target.height * 0.5, 0));
    bot.attack(target);
    await sleep(600);
  }

  if (!bot.entities[tid]) {
    killed++;
    await sleep(400);
    await lib.pickup(6);
  }
}

console.log(`Killed: ${killed}, inventory now:`, JSON.stringify(lib.inv()));
console.log('Night in:', lib.time().secondsUntilNight);
