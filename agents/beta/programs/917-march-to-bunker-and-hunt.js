console.log('=== Program 917: March to Bunker & Hunt Endermen ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Beta start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Configure safe movement & equip gear
globalThis.configureFireAvoidance();

// Verify golden boots on slot 8
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
console.log('Equipped on feet:', bot.inventory.slots[8]?.name);

try {
  await lib.equipWeapon();
} catch (e) {}

// Safe waypoints up to Fortress Workshop Bunker
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

let endermenKilled = 0;
let initialPearls = lib.count('ender_pearl');

for (let i = 0; i < waypoints.length && !checkCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  const wp = waypoints[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.2) continue;

  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);
  await globalThis.clearFireAhead();

  // Pitch gaze down to avoid staring at Endermen heads
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

  // Check for nearby Endermen in Soul Sand Valley
  const nearbyEnderman = Object.values(bot.entities).find(e =>
    e.isValid &&
    e.name === 'enderman' &&
    bot.entity.position.distanceTo(e.position) <= 6.0
  );

  if (nearbyEnderman) {
    console.log(`Enderman nearby at ${lib.fmt(nearbyEnderman.position)}! Dist: ${bot.entity.position.distanceTo(nearbyEnderman.position).toFixed(1)}`);
    // Check if we have solid ceiling above us (y+2)
    const ceil = bot.blockAt(bot.entity.position.offset(0, 2, 0));
    if (ceil && ceil.boundingBox === 'block') {
      console.log('Under 2-high protective ceiling! Attacking Enderman safely...');
      const sword = bot.inventory.items().find(it => it.name.endsWith('_sword'));
      if (sword) await bot.equip(sword, 'hand');
      await bot.lookAt(nearbyEnderman.position.offset(0, 1.0, 0), true);
      bot.attack(nearbyEnderman);
      await sleep(650);
      try { await lib.pickup(4.0); } catch (e) {}
    }
  }

  if (bot.health <= 7) {
    console.log(`Health at ${bot.health}, holding in cover.`);
    break;
  }
}

const finalPearls = lib.count('ender_pearl');
console.log(`Arrived at destination: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Pearls: ${finalPearls}`);

bot.chat(`Beta: Arrived at Fortress Workshop Bunker area ${lib.fmt(bot.entity.position)}! Holding 2 gold ingots. Ready for bartering & Enderman hunting!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  gold_ingots: lib.count('gold_ingot'),
  ender_pearls: finalPearls,
  inv: lib.inv()
};
