// programs/642-march-and-slay.js
console.log('=== Program 642: Nether Pillbox March & Blaze Slayer ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// Ensure fire avoidance is active
globalThis.configureFireAvoidance();

// Waypoints to Spawner Pillbox with safe bridge routing
const SAFE_WAYPOINTS = [
  new Vec3(46, 65, -7),
  new Vec3(54, 65, -7),
  new Vec3(63, 64, -7),
  new Vec3(63, 65, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127), // Fortress Workshop Bunker
  new Vec3(44, 65, -145), // Covered Tunnel
  new Vec3(44, 65, -160),
  new Vec3(44, 65, -169), // Blast Wall
  new Vec3(38, 65, -176), // Cross Bridge start
  new Vec3(37, 65, -178), // Turn safely west
  new Vec3(37, 66, -182), // Covered approach
  new Vec3(36, 66, -185), // Pillbox entry
  new Vec3(36, 66, -187)  // Spawner Pillbox Firing Slit
];

bot.chat('alpha: In Nether! Marching along safe covered waypoints to Spawner Pillbox (36, 66, -187)...');

// March along waypoints
for (let i = 0; i < SAFE_WAYPOINTS.length && !isCancelled(); i++) {
  const wp = SAFE_WAYPOINTS[i];
  if (bot.entity.position.distanceTo(wp) < 1.5) continue;

  // Sneak on bridge past z=-170 to guarantee no falls off edges or knockback into lava
  if (wp.z <= -170) {
    bot.setControlState('sneak', true);
  } else {
    bot.setControlState('sneak', false);
  }

  // Keep gaze low to avoid Endermen
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.0, { dig: false, timeoutMs: 10000 });
  } catch (err) {
    try {
      await bot.lookAt(wp.offset(0.5, 0.5, 0.5), true);
      bot.setControlState('forward', true);
      await sleep(700);
      bot.setControlState('forward', false);
    } catch (e2) {}
  }

  try { await lib.pickup(3.0); } catch (e) {}

  if (bot.health <= 7) {
    console.log(`HP low (${bot.health}) during march at WP ${i + 1}, taking cover.`);
    break;
  }
}
bot.setControlState('sneak', false);

console.log('Arrived at Spawner area! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Step 2: Step into exact firing stance at (36.0, 66.0, -186.5)
try {
  await lib.goTo(36.0, 66.0, -186.5, 0.5, { dig: false, timeoutMs: 6000 });
} catch (e) {
  await bot.lookAt(new Vec3(36.0, 66.0, -186.5));
  bot.setControlState('forward', true);
  await sleep(600);
  bot.setControlState('forward', false);
}

// Step 3: Combat loop
await lib.equipWeapon();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

bot.chat(`alpha: Locked behind Pillbox firing slit at ${lib.fmt(bot.entity.position)}! Slaying Blazes for Milestone 8! Rods: ${lib.count('blaze_rod')}/8`);

const combatStart = Date.now();
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let blazesKilled = 0;
let piglinsKilled = 0;

while (!isCancelled() && Date.now() - combatStart < 140000) {
  // Low health retreat
  if (bot.health <= 6) {
    console.log(`HP low (${bot.health.toFixed(1)}/20)! Retreating to covered corridor at (44, 65, -169)...`);
    bot.chat(`alpha: HP low (${bot.health.toFixed(1)}/20)! Falling back to covered corridor!`);
    try { await lib.goTo(44, 65, -169, 1.5, { timeoutMs: 5000 }); } catch (e) {}
    break;
  }

  // Defend against any Piglin within melee reach
  const hostilePiglins = Object.values(bot.entities)
    .filter(e => e.name === 'piglin' && e.isValid && (e.health === undefined || e.health > 0) && bot.entity.position.distanceTo(e.position) <= 3.8);
  if (hostilePiglins.length > 0) {
    const pig = hostilePiglins[0];
    if (Date.now() - lastAttack > 625) {
      await bot.lookAt(pig.position.offset(0, 1.4, 0), true);
      bot.attack(pig);
      lastAttack = Date.now();
      console.log(`Defending against Piglin at ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m!`);
      if (pig.health !== undefined && pig.health <= 0) piglinsKilled++;
    }
    await sleep(100);
    continue;
  }

  // Attack nearest Blaze
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    if (dist <= 4.8 && Date.now() - lastAttack > 625) {
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
      bot.attack(target);
      lastAttack = Date.now();
      console.log(`Hit Blaze at ${dist.toFixed(1)}m (Blaze HP: ${target.health !== undefined ? target.health.toFixed(1) : '?'})`);
      if (target.health !== undefined && target.health <= 0) blazesKilled++;
    }
  }

  // Safe stationary drop pickup (stay east of x=35.5)
  if (bot.entity.position.x >= 35.5 && Math.random() < 0.25) {
    try { await lib.pickup(2.5); } catch (e) {}
  }

  // Rods check
  const curRods = lib.count('blaze_rod');
  if (curRods > lastRods) {
    console.log(`*** BLAZE ROD HARVESTED! Total: ${curRods}/8 ***`);
    bot.chat(`alpha: BLAZE ROD HARVESTED! Total: ${curRods}/8!`);
    lastRods = curRods;
  }

  if (curRods >= 8) {
    bot.chat(`alpha: MILESTONE 8 COMPLETE! We have ${curRods} Blaze Rods!`);
    break;
  }

  await sleep(150);
}

// Final drop pickup
if (bot.entity.position.x >= 35.5) {
  try { await lib.pickup(3.0); } catch (e) {}
}

const finalRods = lib.count('blaze_rod');
console.log(`=== Combat Round Ended. Blazes killed: ${blazesKilled}, Piglins: ${piglinsKilled}, Blaze Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20 ===`);
bot.chat(`alpha: Combat round ended. Blazes: ${blazesKilled}, Blaze Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20`);

if (finalRods >= 8) {
  console.log('Milestone 8 complete! Retreating to Overworld base...');
  await retreatToOverworldBase();
}

console.log('=== Program 642 Complete ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Rods:', lib.count('blaze_rod'), 'Inv:', lib.inv());
