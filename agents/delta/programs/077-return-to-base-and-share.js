// programs/077-return-to-base-and-share.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// Keep gaze down to avoid looking at endermen
await bot.look(bot.entity.yaw, -0.6, true);

// Waypoints back to base
const waypoints = [
  new Vec3(310, 71, -140),
  new Vec3(305, 71, -100),
  new Vec3(298, 72, -70),
  new Vec3(294, 72, -52)
];

for (const wp of waypoints) {
  const t = lib.time();
  console.log(`Heading to ${lib.fmt(wp)}, timeOfDay: ${t.timeOfDay}, night in: ${t.secondsUntilNight}s`);
  // Look down while moving
  bot.look(bot.entity.yaw, -0.5, true);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (e) {
    console.log(`Waypoint ${lib.fmt(wp)} note:`, e.message);
  }

  // Quick check for animals directly in front of us
  for (const id in bot.entities) {
    const e = bot.entities[id];
    if (e && ['chicken', 'sheep', 'cow', 'pig'].includes(e.name)) {
      const dist = bot.entity.position.distanceTo(e.position);
      if (dist < 6 && t.secondsUntilNight > 100) {
        console.log(`Quick hunt: ${e.name} at dist ${Math.round(dist)}`);
        await lib.equipWeapon();
        bot.attack(e);
        await sleep(400);
        await lib.pickup(4);
        break;
      }
    }
  }
}

console.log('Arrived outside base at:', lib.fmt(bot.entity.position));

// Enter base through door (294, 72, -54)
const doorPos = new Vec3(294, 72, -54);
const door = bot.blockAt(doorPos);
if (door && door.name.includes('door')) {
  console.log('Opening base door...');
  await bot.activateBlock(door);
  await sleep(300);
  await lib.walkTo(294, -56);
  await sleep(300);
  await bot.activateBlock(bot.blockAt(doorPos));
  console.log('Closed base door behind us.');
} else {
  await lib.goTo(294, 72, -56);
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// Put food in chest for Alpha
const chestPos = new Vec3(293, 72, -57);
const foodToShare = {};
for (const item of ['cooked_chicken', 'cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'chicken', 'mutton', 'beef']) {
  if (lib.count(item) > 0) {
    foodToShare[item] = lib.count(item);
  }
}

if (Object.keys(foodToShare).length > 0) {
  console.log('Depositing food into base chest:', JSON.stringify(foodToShare));
  try {
    await lib.deposit(foodToShare, chestPos.x, chestPos.y, chestPos.z);
    bot.chat(`team: Put food in chest: ${JSON.stringify(foodToShare)} for Alpha!`);
  } catch (e) {
    console.log('Deposit error:', e.message);
  }
}

// Check time for sleep
const tFinal = lib.time();
console.log(`Night in ${tFinal.secondsUntilNight}s, canSleep: ${tFinal.canSleep}`);
if (tFinal.canSleep || tFinal.secondsUntilNight < 60) {
  console.log('Night approaching or active, heading to Bed 2 to sleep...');
  bot.chat('team: Delta ready to sleep in Bed 2.');
  try {
    await lib.sleepInBed();
    console.log('Sleeping in bed...');
  } catch (e) {
    console.log('Sleep error:', e.message);
  }
}

console.log('Delta inventory:', JSON.stringify(lib.inv()));
console.log('Health:', bot.health, 'Food:', bot.food);
