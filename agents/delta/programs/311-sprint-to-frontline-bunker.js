// programs/311-sprint-to-frontline-bunker.js
console.log('Delta start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// Dimension guard
if (!String(bot.game.dimension).includes('nether')) {
  console.log('Not in Nether! Aborting.');
  return;
}

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();
await sleep(100);

bot.chat('delta: Sprinting open corridor to Fortress Workshop at (44, 65, -127) and Frontline at (44, 65, -169)!');

const waypoints = [
  { name: 'Corridor End', pos: new Vec3(63.0, 65.0, -30) },
  { name: 'Ridge South', pos: new Vec3(62.0, 65.0, -50) },
  { name: 'Ridge Mid', pos: new Vec3(62.0, 65.0, -70) },
  { name: 'Ridge North', pos: new Vec3(62.0, 65.0, -90) },
  { name: 'Ridge Bend', pos: new Vec3(61.0, 65.0, -100) },
  { name: 'Fortress Approach', pos: new Vec3(50.0, 65.0, -115) },
  { name: 'Fortress Workshop Bunker', pos: new Vec3(44.0, 65.0, -127) },
  { name: 'Covered Tunnel Mid', pos: new Vec3(44.0, 65.0, -145) },
  { name: 'Covered Tunnel North', pos: new Vec3(44.0, 65.0, -160) },
  { name: 'Frontline Blast Wall', pos: new Vec3(44.0, 65.0, -169) }
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`[WP ${i + 1}/${waypoints.length}] Heading to ${wp.name} at ${lib.fmt(wp.pos)} (dist: ${bot.entity.position.distanceTo(wp.pos).toFixed(1)}m)...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.pos.x, wp.pos.y, wp.pos.z, 1));
    console.log(`Reached ${wp.name} at ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Path note to ${wp.name}:`, e.message);
    await bot.lookAt(new Vec3(wp.pos.x, wp.pos.y + 1, wp.pos.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(2000);
    bot.clearControlStates();
  }

  // Pick up drops
  try {
    await lib.pickup(6);
  } catch (e) {}
}

console.log('Arrived at frontline! Pos:', lib.fmt(bot.entity.position));
bot.chat(`delta: Arrived at frontline bunker ${lib.fmt(bot.entity.position)}!`);

// Scan drops at frontline
const drops = Object.values(bot.entities).filter(e => e && (e.name === 'item' || e.type === 'object') && bot.entity.position.distanceTo(e.position) < 25);
console.log(`Drops within 25m: ${drops.length}`);
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

console.log('Final Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
