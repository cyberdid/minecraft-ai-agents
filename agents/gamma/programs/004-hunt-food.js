// programs/004-hunt-food.js
bot.chat('gamma hunting food & wool North of base');

console.log('--- Moving to North hunting grounds ---');
await lib.goTo(305, 70, 15, 3);
console.log('Arrived at', lib.fmt(bot.entity.position));

const animalsToHunt = ['cow', 'sheep', 'pig'];
let totalKilled = 0;

for (let i = 0; i < 8; i++) {
  if (isCancelled()) break;
  if (lib.time().secondsUntilNight < 120) {
    console.log('Night approaching soon, stopping hunt');
    break;
  }

  // Find nearest peaceful animal
  const targets = Object.values(bot.entities)
    .filter(e => e.name && animalsToHunt.includes(e.name) && e.position && e.position.distanceTo(bot.entity.position) < 48)
    .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

  if (targets.length === 0) {
    console.log('No more animals in 48 blocks, exploring slightly north...');
    const found = await lib.explore(0, 1, 15, () => {
      return Object.values(bot.entities).find(e => e.name && animalsToHunt.includes(e.name) && e.position.distanceTo(bot.entity.position) < 32);
    });
    if (!found) {
      console.log('No animals found after explore');
      break;
    }
    continue;
  }

  const target = targets[0];
  console.log(`Hunting ${target.name} at ${lib.fmt(target.position)} (dist: ${target.position.distanceTo(bot.entity.position).toFixed(1)})`);

  await lib.equipWeapon();
  try {
    await bot.pathfinder.goto(new goals.GoalNear(target.position.x, target.position.y, target.position.z, 2));
  } catch (e) {
    console.log('Could not path to animal:', e.message);
    continue;
  }

  const targetId = target.id;
  const deadline = Date.now() + 15000;
  while (bot.entities[targetId] && Date.now() < deadline && !isCancelled()) {
    await bot.lookAt(target.position.offset(0, target.height * 0.5, 0));
    bot.attack(target);
    await sleep(600);
  }

  if (!bot.entities[targetId]) {
    totalKilled++;
    await sleep(500);
    await lib.pickup(6);
  }
}

console.log(`Killed ${totalKilled} animals. Current inventory:`, JSON.stringify(lib.inv()));

// Check if we need to return towards base
if (lib.time().secondsUntilNight < 100) {
  console.log('Returning towards base for safety...');
  await lib.goTo(294, 72, -50, 3);
}

bot.chat(`gamma hunt complete: killed ${totalKilled}. Inventory: ${JSON.stringify(lib.inv())}`);
