// programs/342-sprint-to-spawner-front.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Reset pathfinder states
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();
await sleep(100);

bot.chat('delta: Sprinting through covered corridor to Spawner Frontline with stone sword & cobble!');

// 1. Safe exit from bunker at z = -8.0
console.log('Exiting bunker at z=-8.0...');
await lib.walkTo(40.5, -8.0, 2000);
bot.clearControlStates();

// 2. Follow valley floor to East Ridge (63, 65, -8)
const toRidge = [
  new Vec3(48, 65, -8),
  new Vec3(56, 65, -8),
  new Vec3(63, 65, -8)
];
for (const wp of toRidge) {
  if (isCancelled()) break;
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1, { timeoutMs: 6000 });
  } catch (e) {
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    await sleep(1500);
    bot.clearControlStates();
  }
}

// 3. Sprint through covered corridor
const corridor = [
  new Vec3(63.0, 65.0, -15),
  new Vec3(63.0, 65.0, -30),
  new Vec3(62.0, 65.0, -50),
  new Vec3(62.0, 65.0, -70),
  new Vec3(62.0, 65.0, -90),
  new Vec3(61.0, 65.0, -100),
  new Vec3(50.0, 65.0, -115),
  new Vec3(44.0, 65.0, -127), // Fortress Workshop Bunker
  new Vec3(44.0, 65.0, -145), // Covered Advance Tunnel
  new Vec3(44.0, 65.0, -160),
  new Vec3(44.0, 65.0, -169), // Frontline Blast Wall
  new Vec3(38.0, 65.0, -176)  // Fortified Cross-Bridge
];

for (let i = 0; i < corridor.length && !isCancelled(); i++) {
  const wp = corridor[i];
  console.log(`Corridor waypoint [${i + 1}/${corridor.length}]: (${wp.x}, ${wp.y}, ${wp.z})`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.2));
  } catch (e) {
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(1500);
    bot.clearControlStates();
  }
}

console.log('Arrived at fortified cross-bridge! Pos:', lib.fmt(bot.entity.position));

// 4. Check nearby players
const players = Object.values(bot.players).filter(p => p.username !== bot.username && p.entity);
for (const p of players) {
  console.log(`Player ${p.username} nearby at ${lib.fmt(p.entity.position)}, dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
}

// 5. Look for hostile Blazes or drops
const blazes = Object.values(bot.entities).filter(e => e && e.name === 'blaze' && bot.entity.position.distanceTo(e.position) < 8);
console.log(`Blazes nearby: ${blazes.length}`);
if (blazes.length > 0) {
  const target = blazes[0];
  console.log(`Engaging Blaze at ${lib.fmt(target.position)}!`);
  const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
  if (sword) await bot.equip(sword, 'hand');
  await bot.lookAt(target.position.offset(0, 1.5, 0), true);
  await bot.attack(target);
  await sleep(600);
  await bot.attack(target);
}

// 6. Pickup any dropped items (Blaze rods, coal, etc.)
try {
  const picked = await lib.pickup(8);
  console.log(`Picked up items:`, picked);
} catch (e) {}

// Check inventory
console.log('Current Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

bot.chat(`delta: Reached Spawner Frontline ${lib.fmt(bot.entity.position)}! HP ${bot.health}/20, cobble: ${lib.count('cobblestone')}, rods: ${lib.count('blaze_rod')}`);
