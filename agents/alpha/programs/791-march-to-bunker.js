// programs/791-march-to-bunker.js
console.log('=== Program 791: March to Fortress Workshop Bunker ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Equip weapon and offhand shield if available
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

try {
  const sword = bot.inventory.items().find(i => i.name === 'iron_sword') || bot.inventory.items().find(i => i.name.includes('sword'));
  if (sword) await bot.equip(sword, 'hand');
} catch (e) {}

// 2. Configure fire avoidance
globalThis.configureFireAvoidance();

// 3. Announce in chat
bot.chat('alpha: Marching to Fortress Workshop Bunker (44, 65, -127) to unite with Delta, Beta & Gamma for Milestone 9!');

// 4. Safe Waypoints to Fortress Workshop Bunker
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
  { x: 44, y: 65, z: -127 }, // Bunker entrance
  { x: 44, y: 65, z: -134 }  // Bunker interior & crafting table
];

// Determine starting waypoint based on distance
let startIdx = 0;
let closestDist = Infinity;
for (let i = 0; i < bunkerWaypoints.length; i++) {
  const d = bot.entity.position.distanceTo(new Vec3(bunkerWaypoints[i].x, bunkerWaypoints[i].y, bunkerWaypoints[i].z));
  if (d < 4.0 && i > startIdx) {
    startIdx = i;
  }
}

console.log(`Starting march from WP index ${startIdx}/${bunkerWaypoints.length}...`);

for (let i = startIdx; i < bunkerWaypoints.length && !checkCancelled(); i++) {
  const wp = bunkerWaypoints[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  
  if (bot.entity.position.distanceTo(target) < 1.8) {
    console.log(`Already at WP ${i} (${wp.x}, ${wp.y}, ${wp.z})`);
    continue;
  }

  console.log(`Advancing to WP ${i}: (${wp.x}, ${wp.y}, ${wp.z}) - Current: ${lib.fmt(bot.entity.position)}`);

  await globalThis.clearFireAhead();

  // Look low at feet level to prevent Enderman gaze aggro
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  // Raise shield if equipped in offhand
  if (bot.inventory.slots[45]?.name === 'shield') {
    bot.activateItem(true);
  }

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    try {
      await globalThis.clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
    } catch (e2) {
      try {
        await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 6000 });
      } catch (e3) {
        console.log(`Could not reach WP ${i} directly: ${e3.message}`);
      }
    }
  }

  await globalThis.clearFireAhead();
  try { await lib.pickup(3.0); } catch (e) {}

  // Defend against immediate hostile in melee range
  const hostiles = lib.hostiles(3.5);
  if (hostiles.length > 0 && hostiles[0].entity) {
    console.log(`Hostile nearby: ${hostiles[0].name} at ${lib.fmt(hostiles[0].position)}`);
    bot.deactivateItem();
    try {
      const sword = bot.inventory.items().find(it => it.name.includes('sword'));
      if (sword) await bot.equip(sword, 'hand');
      bot.attack(hostiles[0].entity);
      await sleep(600);
    } catch (e) {}
    if (bot.inventory.slots[45]?.name === 'shield') {
      bot.activateItem(true);
    }
  }

  if (bot.health <= 7) {
    console.log(`Health critical (${bot.health}), halting march for safety at WP ${i}.`);
    break;
  }
}

bot.deactivateItem();
console.log('March complete. Final pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

const distToBunker = bot.entity.position.distanceTo(new Vec3(44, 65, -134));
console.log(`Distance to Bunker interior (44, 65, -134): ${distToBunker.toFixed(1)}m`);

if (distToBunker < 8.0) {
  bot.chat('alpha: Reunited with team at Fortress Workshop Bunker (44, 65, -134)! Ready for Milestone 9!');
}

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  distToBunker: distToBunker.toFixed(1),
  inv: lib.inv()
};
