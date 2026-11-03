// programs/472-enter-base-and-shelter.js
globalThis.isProgramCancelled = () => false;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Delta starting move to base from:', lib.fmt(bot.entity.position));

// 1. Pathfind to outside base door (294, 72, -53)
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 0.8));
} catch (e) {
  try { await lib.goToXZ(294, -53); } catch (e2) {}
}

console.log('Outside base door at:', lib.fmt(bot.entity.position));

// 2. Go through door into base
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('goThroughDoor note:', e.message);
}

// 3. Stand at Bed 2 (293, 72, -56)
try {
  await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 0.5));
} catch (e) {}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 4. Equip shield and weapon
try { await lib.equipArmor(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

bot.chat('delta: Inside Base shelter (293, 72, -56) with shield! Ready for night sleep and Milestone 9.');

// 5. If night, sleep in bed 2
const timeOfDay = bot.time.timeOfDay;
console.log('Time of day:', timeOfDay);
if (timeOfDay >= 12542 && timeOfDay <= 23460) {
  const bedBlock = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 4 });
  if (bedBlock) {
    try {
      console.log('Sleeping in bed...');
      await bot.sleep(bedBlock);
      console.log('Sleeping!');
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }
}

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay,
  inv: lib.inv()
};
