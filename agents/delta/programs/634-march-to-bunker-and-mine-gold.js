console.log('=== DELTA: MARCH TO FORTRESS BUNKER & SECURE GOLDEN BOOTS ===');

configureFireAvoidance();
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log(`Current pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

const waypoints = [
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
  { x: 44, y: 65, z: -127 }
];

// Determine starting waypoint
let startIdx = 0;
for (let i = 0; i < waypoints.length; i++) {
  const wp = waypoints[i];
  if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 4.0) {
    startIdx = i + 1;
  }
}

console.log(`Marching to Bunker starting from waypoint index ${startIdx}/${waypoints.length}...`);

for (let i = startIdx; i < waypoints.length && !isCancelled(); i++) {
  await clearFireAhead();
  const wp = waypoints[i];
  const target = new Vec3(wp.x, wp.y, wp.z);

  // Keep gaze low to avoid Endermen aggro
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
    } catch (e2) {}
  }

  await clearFireAhead();
  try { await lib.pickup(3.0); } catch (e) {}

  if (bot.health <= 7) {
    console.log(`Health low (${bot.health}) at WP ${i}, holding cover.`);
    break;
  }
}

// Enter inside bunker
console.log('Entering bunker entrance at (44, 65, -127)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(44.0, 65.0, -132.0, 1.0));
} catch (e) {}

console.log(`Inside Fortress Workshop Bunker! Pos: ${lib.fmt(bot.entity.position)}`);
bot.chat(`delta: Inside Fortress Workshop Bunker at (44, 65, -132)! HP: ${bot.health}/20. Scouting gold for golden_boots.`);

// Check for nether gold ore nearby
const goldOres = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gold_ore'),
  maxDistance: 16,
  count: 8
});
console.log(`Found ${goldOres.length} gold ores within 16m:`, goldOres.map(p => lib.fmt(p)));

// If gold ore found and we can reach it, mine it
for (const gp of goldOres) {
  if (isCancelled() || lib.count('gold_nugget') >= 36 || lib.count('gold_ingot') >= 4) break;
  console.log(`Mining nether_gold_ore at ${lib.fmt(gp)}...`);
  try {
    await lib.dig(gp.x, gp.y, gp.z);
    await sleep(300);
    await lib.pickup(3.0);
  } catch (err) {
    console.log('Dig gold error:', err.message);
  }
}

console.log(`Gold nuggets: ${lib.count('gold_nugget')}, Gold ingots: ${lib.count('gold_ingot')}`);

// If we have nuggets >= 9, craft ingots
if (lib.count('gold_nugget') >= 9) {
  try {
    await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
  } catch (e) {
    console.log('Craft ingot error:', e.message);
  }
}

// If we have ingots >= 4, craft golden_boots and equip!
if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
  try {
    await lib.craft('golden_boots', 1);
    await lib.equipArmor();
    bot.chat('delta: Crafted and equipped golden_boots! 100% Piglin neutrality ACTIVE for Milestone 9!');
  } catch (e) {
    console.log('Craft boots error:', e.message);
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  golden_boots: lib.count('golden_boots'),
  gold_ingots: lib.count('gold_ingot'),
  gold_nuggets: lib.count('gold_nugget')
};
