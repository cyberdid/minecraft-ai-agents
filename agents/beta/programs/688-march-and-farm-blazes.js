// programs/688-march-and-farm-blazes.js
console.log('=== Program 688: March to Pillbox & Farm Blaze Rods ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

configureFireAvoidance();
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const waypoints = NETHER_PILLBOX_WAYPOINTS;
console.log(`Starting march through ${waypoints.length} waypoints...`);

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  const dist = bot.entity.position.distanceTo(target);

  if (dist < 3.0) {
    console.log(`Already at WP ${i + 1}/${waypoints.length} (${wp.x}, ${wp.y}, ${wp.z})`);
    continue;
  }

  console.log(`Moving to WP ${i + 1}/${waypoints.length}: (${wp.x}, ${wp.y}, ${wp.z}), dist: ${dist.toFixed(1)}m...`);
  let reached = false;
  for (let attempt = 1; attempt <= 2 && !reached && !isCancelled(); attempt++) {
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2.0, { dig: false, timeoutMs: 12000 });
      reached = true;
    } catch (err) {
      console.log(`WP ${i + 1} attempt ${attempt} error: ${err.message}`);
      if (attempt === 1) {
        try {
          await lib.goToXZ(wp.x, wp.z, { timeoutMs: 8000 });
          reached = true;
        } catch (err2) {
          console.log(`WP ${i + 1} goToXZ error: ${err2.message}`);
        }
      }
    }
  }

  try { await lib.pickup(3.5); } catch (e) {}
  console.log(`At pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

  if (bot.health <= 7) {
    console.log(`CRITICAL: Health low (${bot.health}) at WP ${i + 1}! Pausing in cover.`);
    break;
  }
}

const pillboxPos = new Vec3(36, 66, -187);
const distToPillbox = bot.entity.position.distanceTo(pillboxPos);
console.log(`March phase completed. Distance to Pillbox: ${distToPillbox.toFixed(1)}m`);

if (distToPillbox <= 10) {
  bot.chat('Beta: Reached Spawner Pillbox! Engaging Blazes...');
  console.log('=== Step 2: Farming Blaze Rods at Pillbox ===');
  const farmRes = await farmBlazeRodsAtPillbox(8, 120000);
  console.log('Farm results:', JSON.stringify(farmRes));

  if (lib.count('blaze_rod') >= 8) {
    bot.chat(`Beta: 8 Blaze Rods collected! Total: ${lib.count('blaze_rod')}. Retreating to base.`);
    console.log('Retreating to Overworld base...');
    await retreatToOverworldBase();
  }
} else {
  console.log('Not close enough to Pillbox to farm. Current pos:', lib.fmt(bot.entity.position));
}

console.log('=== Final Status ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Blaze Rods:', lib.count('blaze_rod'));
console.log('Inv:', JSON.stringify(lib.inv()));

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: lib.count('blaze_rod'),
  hp: bot.health
};
