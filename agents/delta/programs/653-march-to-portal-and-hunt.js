console.log('=== DELTA: MARCH TO PORTAL CAMP & SOUL SAND VALLEY ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

configureFireAvoidance();
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Safe waypoints from Bunker (44, 65, -127) to Portal Camp (46, 65, -7)
const waypoints = [
  { x: 44, y: 65, z: -127 },
  { x: 50, y: 65, z: -115 },
  { x: 61, y: 66, z: -100 },
  { x: 62.0, y: 67, z: -80 },
  { x: 61.5, y: 67, z: -75 },
  { x: 61.5, y: 67, z: -70 },
  { x: 61.5, y: 67, z: -65 },
  { x: 61.5, y: 67, z: -60 },
  { x: 61.5, y: 67, z: -55 },
  { x: 62, y: 67, z: -50 },
  { x: 63, y: 66, z: -35 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 64, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 46, y: 65, z: -7 }
];

let endermenKilled = 0;

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);
  await clearFireAhead();

  // Keep gaze low (pitch looking at feet/ground) to avoid accidentally staring at Endermen heads
  await bot.lookAt(new Vec3(wp.x, bot.entity.position.y - 0.5, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
    } catch (e2) {}
  }

  await clearFireAhead();
  try { await lib.pickup(3.5); } catch (e) {}

  // Check for nearby Endermen within 8m
  const nearbyEndermen = Object.values(bot.entities).filter(e =>
    e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 8.0
  );

  for (const ender of nearbyEndermen) {
    if (bot.health < 10) break;
    console.log(`Enderman spotted at ${lib.fmt(ender.position)}!`);
    // Engage safely: face feet/legs
    const legs = ender.position.offset(0, 0.4, 0);
    await bot.lookAt(legs, true);
    if (bot.entity.position.distanceTo(ender.position) <= 4.0) {
      try { await lib.equipWeapon(); } catch (e) {}
      bot.attack(ender);
      await sleep(650);
      try { await lib.pickup(4.0); } catch (e) {}
    }
  }

  // Safety check
  if (bot.health <= 6) {
    console.log(`HP low (${bot.health}), pausing march for safety.`);
    break;
  }
}

console.log(`Arrived near Portal Camp! Pos: ${lib.fmt(bot.entity.position)}`);

// Check Portal status
const portalBlocks = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 24,
  count: 10
});
console.log(`Active nether_portal blocks found: ${portalBlocks.length}`);

if (portalBlocks.length === 0) {
  console.log('Portal is EXTINGUISHED! Searching for obsidian frame to ignite...');
  const obsidians = bot.findBlocks({
    matching: b => b && b.name === 'obsidian',
    maxDistance: 24,
    count: 30
  });
  console.log(`Obsidian blocks found: ${obsidians.length}`);
  
  if (obsidians.length > 0) {
    // Find bottom sill obsidian (lowest Y with air above)
    let bestSill = null;
    for (const op of obsidians) {
      const up = bot.blockAt(op.offset(0, 1, 0));
      if (up && (up.name === 'air' || up.name === 'cave_air')) {
        if (!bestSill || op.y < bestSill.y) {
          bestSill = op;
        }
      }
    }

    if (bestSill) {
      console.log(`Identified portal sill at ${lib.fmt(bestSill)}. Moving to ignite...`);
      try {
        await bot.pathfinder.goto(new goals.GoalNear(bestSill.x, bestSill.y + 1, bestSill.z, 2.5));
      } catch (e) {}

      const flint = bot.inventory.items().find(i => i.name === 'flint_and_steel');
      if (flint) {
        await bot.equip(flint.type, 'hand');
        const sillBlock = bot.blockAt(bestSill);
        console.log(`Activating block on top of sill at ${lib.fmt(bestSill)} with flint_and_steel...`);
        await bot.activateBlock(sillBlock, new Vec3(0, 1, 0));
        await sleep(1500);

        const newPortals = bot.findBlocks({
          matching: b => b && b.name === 'nether_portal',
          maxDistance: 16,
          count: 10
        });
        console.log(`Portal ignition result: ${newPortals.length} active nether_portal blocks!`);
        if (newPortals.length > 0) {
          bot.chat(`delta: Nether portal at ${lib.fmt(bestSill)} successfully RELIT with flint and steel!`);
        }
      } else {
        console.log('No flint_and_steel in inventory!');
      }
    }
  }
} else {
  console.log(`Portal is ALREADY ACTIVE with ${portalBlocks.length} blocks!`);
}

try { await lib.pickup(5.0); } catch (e) {}

const pearls = lib.count('ender_pearl');
console.log(`Current Ender Pearls: ${pearls}`);
bot.chat(`delta: Reached Portal Camp. Ender Pearls: ${pearls}/12, Gold Ingots: ${lib.count('gold_ingot')}, HP: ${bot.health}/20.`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  pearls,
  portalActive: portalBlocks.length > 0
};
