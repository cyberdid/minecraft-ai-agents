// programs/306-hop-and-sprint-tunnel.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

bot.pathfinder.stop();
await sleep(100);

// Hop out of soul sand onto dirt
console.log('Hopping out of soul sand onto dirt...');
await bot.lookAt(new Vec3(63.5, 65.5, -15), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(500);
bot.setControlState('jump', false);
await sleep(500);
bot.clearControlStates();

console.log('Pos after hop:', lib.fmt(bot.entity.position), 'exact:', bot.entity.position);

bot.chat('delta: Soul sand step overcome! Sprinting East Ridge corridor to Fortress Workshop & Frontline!');

// Now sprint along waypoints
const waypoints = [
  new Vec3(63.5, 65, -15),
  new Vec3(63.5, 65, -30),
  new Vec3(62.5, 65, -50),
  new Vec3(62.5, 65, -70),
  new Vec3(62.5, 65, -90),
  new Vec3(61.5, 65, -100),
  new Vec3(50.0, 65, -115),
  new Vec3(44.0, 65, -127), // Fortress Workshop Bunker
  new Vec3(44.0, 65, -145), // Covered Advance Tunnel
  new Vec3(44.0, 65, -160),
  new Vec3(44.0, 65, -169)  // Frontline Blast Wall
];

// Configure pathfinder movements to allow jumping
const defaultMove = new Movements(bot, mcData);
defaultMove.canDig = false;
bot.pathfinder.setMovements(defaultMove);

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`[WP ${i + 1}/${waypoints.length}] Heading to ${lib.fmt(wp)} (dist: ${bot.entity.position.distanceTo(wp).toFixed(1)}m)...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1));
    console.log(`Reached WP ${i + 1} at ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Path note to ${lib.fmt(wp)}:`, e.message);
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(1500);
    bot.clearControlStates();
  }

  // Pick up drops
  try {
    await lib.pickup(6);
  } catch (e) {}
}

console.log('Arrived at frontline! Pos:', lib.fmt(bot.entity.position));
bot.chat(`delta: Arrived at frontline bunker ${lib.fmt(bot.entity.position)}!`);

// Scan drops
const drops = Object.values(bot.entities).filter(e => e && (e.name === 'item' || e.type === 'object') && bot.entity.position.distanceTo(e.position) < 20);
console.log(`Drops within 20m: ${drops.length}`);
for (const d of drops) {
  console.log(`  Drop at ${lib.fmt(d.position)} (dist: ${bot.entity.position.distanceTo(d.position).toFixed(1)}m)`);
  if (bot.entity.position.distanceTo(d.position) < 8) {
    try {
      await lib.pickup(8);
    } catch (e) {}
  }
}

// Equip best weapons and armor
try {
  await lib.equipArmor();
  await lib.equipWeapon();
} catch (e) {}

console.log('Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
