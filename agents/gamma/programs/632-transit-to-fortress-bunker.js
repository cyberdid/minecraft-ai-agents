// programs/632-transit-to-fortress-bunker.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 632: TRANSIT TO FORTRESS WORKSHOP BUNKER ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Regear: ensure shield in offhand, golden boots on feet, sword ready
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}
const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
if (sw) await bot.equip(sw, 'hand');

// 2. Warp into the Nether if in Overworld
if (bot.game.dimension === 'overworld') {
  console.log('Warping through Nether portal at (299.5, 73.0, -54.0)...');
  bot.chat('gamma: Entering Nether portal to reunite with team at Fortress Workshop Bunker!');
  await globalThis.enterNetherPortal(30000);
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to enter the_nether, currently in ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}`);
}

console.log('Successfully in the_nether at', lib.fmt(bot.entity.position));

// 3. Configure movement and fire avoidance
globalThis.configureFireAvoidance();

// Safe waypoints from Nether Portal to Fortress Workshop Bunker
const BUNKER_WAYPOINTS = [
  { x: 46.0, y: 65.0, z: -7.0 },
  { x: 54.0, y: 65.0, z: -7.0 },
  { x: 63.0, y: 64.0, z: -7.0 },
  { x: 63.0, y: 65.0, z: -20.0 },
  { x: 63.0, y: 66.0, z: -35.0 },
  { x: 62.0, y: 67.0, z: -50.0 },
  { x: 61.5, y: 67.0, z: -55.0 },
  { x: 61.5, y: 67.0, z: -60.0 },
  { x: 61.5, y: 67.0, z: -65.0 },
  { x: 61.5, y: 67.0, z: -70.0 },
  { x: 61.5, y: 67.0, z: -75.0 },
  { x: 62.0, y: 67.0, z: -80.0 },
  { x: 61.0, y: 66.0, z: -100.0 },
  { x: 50.0, y: 65.0, z: -115.0 },
  { x: 44.0, y: 65.0, z: -127.0 }, // Bunker entrance
  { x: 44.0, y: 65.0, z: -131.0 }  // Inside Workshop Bunker
];

// Determine starting waypoint index
let startIdx = 0;
for (let i = 0; i < BUNKER_WAYPOINTS.length; i++) {
  const wp = BUNKER_WAYPOINTS[i];
  if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 3.5) {
    startIdx = i + 1;
  }
}

console.log(`Advancing from WP index ${startIdx}/${BUNKER_WAYPOINTS.length} towards Bunker at (44, 65, -131)...`);

for (let i = startIdx; i < BUNKER_WAYPOINTS.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') {
    console.log('Dimension changed during march, breaking loop.');
    break;
  }

  await globalThis.clearFireAhead();

  const wp = BUNKER_WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 1.5) continue;

  // Keep gaze low to avoid Enderman aggro
  await bot.lookAt(new Vec3(wp.x, 63.5, wp.z));

  // Raise shield if exposed on ridge
  if (wp.z <= -20 && wp.z >= -100) {
    bot.activateItem(true);
  } else {
    bot.deactivateItem();
  }

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.2));
  } catch (e) {
    try {
      await globalThis.clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
    } catch (e2) {}
  }

  await globalThis.clearFireAhead();

  if (bot.health <= 6) {
    console.log(`HP low (${bot.health}), pausing march for safety.`);
    break;
  }
}

bot.deactivateItem();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

console.log('Arrived at position:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// 4. Scan nearby teammates and entities
const nearby = Object.values(bot.entities).filter(e => e.isValid && e !== bot.entity);
const players = nearby.filter(e => e.type === 'player');
for (const p of players) {
  console.log(`Teammate: ${p.username} at ${lib.fmt(p.position)}, dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
}

// Check Piglins at same level (y=64..66)
const reachablePiglins = nearby.filter(e =>
  e.name === 'piglin' &&
  Math.abs(e.position.y - bot.entity.position.y) <= 2.5 &&
  bot.entity.position.distanceTo(e.position) <= 16
);
console.log(`Reachable Piglins on same level: ${reachablePiglins.length}`);
for (const rp of reachablePiglins) {
  console.log(`- Reachable Piglin at ${lib.fmt(rp.position)}, dist: ${bot.entity.position.distanceTo(rp.position).toFixed(1)}m`);
}

bot.chat(`gamma: Reunited at Fortress Workshop Bunker ${lib.fmt(bot.entity.position)}! Gold ingots: ${lib.count('gold_ingot')}, HP: ${bot.health.toFixed(1)}/20.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  ingots: lib.count('gold_ingot'),
  pearls: lib.count('ender_pearl'),
  players: players.map(p => ({ name: p.username, pos: p.position }))
};
