console.log('=== Program 920: March East Ridge to Fortress Workshop Bunker ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Beta start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Configure fire avoidance and equip golden boots
globalThis.configureFireAvoidance();

if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
console.log('Equipped on feet:', bot.inventory.slots[8]?.name);

const sword = bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (sword) {
  try { await bot.equip(sword, 'hand'); } catch (e) {}
}

// 2. Safe Waypoints along East Ridge to Fortress Workshop Bunker
const waypoints = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 66, z: -35 },
  { x: 62, y: 67, z: -50 },
  { x: 61.5, y: 67, z: -55 },
  { x: 61.5, y: 67, z: -60 },
  { x: 61.5, y: 67, z: -65 },
  { x: 61.5, y: 67, z: -70 },
  { x: 61.5, y: 67, z: -75 },
  { x: 62.0, y: 67, z: -80 },
  { x: 61, y: 66, z: -100 },
  { x: 50, y: 65, z: -115 },
  { x: 44, y: 65, z: -127 } // Bunker
];

// Determine starting waypoint index closest to current position
let startIdx = 0;
for (let i = 0; i < waypoints.length; i++) {
  const wp = waypoints[i];
  if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 3.5) {
    startIdx = i + 1;
  }
}

console.log(`Starting march from WP ${startIdx}/${waypoints.length}...`);

for (let i = startIdx; i < waypoints.length && !checkCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  const wp = waypoints[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);
  await globalThis.clearFireAhead();

  // Pitch gaze down to ground to avoid staring at Endermen heads
  await bot.lookAt(new Vec3(wp.x, bot.entity.position.y - 0.5, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await globalThis.clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
    } catch (e2) {}
  }

  await globalThis.clearFireAhead();
  try { await lib.pickup(3.5); } catch (e) {}

  // Safe check: vacuum any pearls or gold dropped along the trail
  const items = Object.values(bot.entities).filter(e =>
    e.isValid && e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 4.0
  );
  if (items.length > 0) {
    try { await lib.pickup(5.0); } catch (e) {}
  }
}

const curPos = bot.entity.position;
console.log(`March loop finished at: ${lib.fmt(curPos)}, HP: ${bot.health}, Pearls: ${lib.count('ender_pearl')}`);

if (curPos.distanceTo(new Vec3(44, 65, -127)) < 8.0) {
  bot.chat('Beta: United with team at Fortress Workshop Bunker (44, 65, -127)! Ready for Piglin bartering & Enderman hunting!');
}

return {
  dimension: bot.game.dimension,
  pos: curPos,
  hp: bot.health,
  food: bot.food,
  gold_ingots: lib.count('gold_ingot'),
  ender_pearls: lib.count('ender_pearl'),
  inv: lib.inv()
};
