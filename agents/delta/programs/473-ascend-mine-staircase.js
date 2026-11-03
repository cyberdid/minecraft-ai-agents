// programs/473-ascend-mine-staircase.js
globalThis.isProgramCancelled = () => false;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Delta ascending from mine shaft at:', lib.fmt(bot.entity.position));

// 1. Craft fresh stone_sword
if (lib.count('cobblestone') >= 2) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('Crafted fresh stone_sword! Swords in inv:', lib.count('stone_sword'));
  } catch (e) {
    console.log('Craft sword note:', e.message);
  }
}

// 2. Ascend staircase waypoints
const STAIR_WAYPOINTS = [
  { x: 299.5, y: 64.0, z: -41.5 },
  { x: 300.5, y: 66.0, z: -42.5 },
  { x: 301.5, y: 68.0, z: -43.5 },
  { x: 302.0, y: 71.0, z: -44.0 }, // Shaft entrance at surface
  { x: 298.0, y: 72.0, z: -50.0 },
  { x: 294.5, y: 72.0, z: -53.5 }  // Outside base door
];

for (let i = 0; i < STAIR_WAYPOINTS.length; i++) {
  const wp = STAIR_WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 1.5) continue;

  console.log(`Ascending to WP ${i + 1}/${STAIR_WAYPOINTS.length} (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 0.8));
  } catch (e) {
    try {
      await bot.lookAt(target.offset(0, 1, 0), true);
      bot.setControlState('forward', true);
      if (target.y > bot.entity.position.y) bot.setControlState('jump', true);
      await sleep(1000);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    } catch (e2) {}
  }
}

console.log('Outside base door at:', lib.fmt(bot.entity.position));

// 3. Go through door into base
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('goThroughDoor note:', e.message);
}

// 4. Stand at Bed 2 (293, 72, -56)
try {
  await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 0.4));
} catch (e) {}

// 5. Equip fresh sword and shield
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

console.log('Delta sheltered inside base at:', lib.fmt(bot.entity.position), 'held:', bot.heldItem?.name, 'offhand:', bot.inventory.slots[45]?.name);
bot.chat('delta: Inside Base shelter (293, 72, -56) with fresh stone sword & shield! Ready for night sleep.');

// 6. Sleep if night
const timeOfDay = bot.time.timeOfDay;
console.log('Time of day:', timeOfDay);
if (timeOfDay >= 12542 && timeOfDay <= 23460) {
  const bedBlock = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 4 });
  if (bedBlock) {
    try {
      console.log('Sleeping in bed...');
      await bot.sleep(bedBlock);
      console.log('Sleeping in bed!');
      bot.chat('delta: Sleeping in Bed 2 to skip night.');
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
