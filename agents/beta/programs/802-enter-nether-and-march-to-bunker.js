// programs/802-enter-nether-and-march-to-bunker.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 802: Enter Nether & March to Fortress Bunker ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); console.log('Equipped golden_boots'); } catch (e) {}
  }
}
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(sh, 'off-hand'); console.log('Equipped shield in off-hand'); } catch (e) {}
}
const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
if (sw) {
  try { await bot.equip(sw, 'hand'); } catch (e) {}
}

// Step 1: Use preloaded enterNetherPortal helper if in overworld
if (bot.game.dimension === 'overworld') {
  bot.chat('Beta: Entering Nether portal to join Gamma at Fortress Bunker for Milestone 9 gold & pearls!');
  console.log('Calling enterNetherPortal()...');
  const result = await globalThis.enterNetherPortal();
  console.log('enterNetherPortal result:', JSON.stringify(result));
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Not in the_nether yet. Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
  return { dimension: bot.game.dimension, pos: bot.entity.position };
}

console.log('Successfully in the_nether at:', lib.fmt(bot.entity.position));

// Step 2: Configure fire avoidance and safe movements
globalThis.configureFireAvoidance();
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = true;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

// Step 3: March safe waypoints from Nether Portal (46, 65, -7) to Fortress Bunker (44, 65, -127)
const bunkerWaypoints = [
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

let startIdx = 0;
for (let i = 0; i < bunkerWaypoints.length; i++) {
  const wp = bunkerWaypoints[i];
  if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 3.5) {
    startIdx = i + 1;
  }
}

console.log(`Marching from WP ${startIdx}/${bunkerWaypoints.length} to Fortress Bunker...`);

for (let i = startIdx; i < bunkerWaypoints.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  await globalThis.clearFireAhead();

  const wp = bunkerWaypoints[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  console.log(`Navigating to WP ${i + 1}/${bunkerWaypoints.length}: ${lib.fmt(target)}`);
  
  // Keep gaze low to avoid Enderman aggro
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    console.log(`Pathfinder retry to WP ${i + 1}: ${e.message}`);
    await globalThis.clearFireAhead();
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
    } catch (e2) {}
  }

  await globalThis.clearFireAhead();
  try { await lib.pickup(3.0); } catch (e) {}

  if (bot.health <= 6) {
    console.log(`Health low (${bot.health}) during march, pausing in cover.`);
    break;
  }
}

console.log('Pos after march:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Verify golden boots still worn
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); console.log('Re-equipped golden_boots!'); } catch (e) {}
  }
}

// Check nearby entities at Bunker
const nearbyPiglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && bot.entity.position.distanceTo(e.position) < 25);
console.log(`Piglins detected nearby (${nearbyPiglins.length}):`, nearbyPiglins.map(p => `${lib.fmt(p.position)} dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}`).join(', '));

const teammates = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log('Teammates nearby:', teammates.map(t => `${t.username} at ${lib.fmt(t.position)}`).join(', '));

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  piglins_nearby: nearbyPiglins.length,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots'
};
