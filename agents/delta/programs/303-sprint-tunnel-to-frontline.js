// programs/303-sprint-tunnel-to-frontline.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// Dimension guard
if (!String(bot.game.dimension).includes('nether')) {
  console.log('Not in Nether! Aborting.');
  return;
}

bot.pathfinder.stop();
await sleep(100);

bot.chat('delta: Sprinting down proven East Ridge corridor to Fortress Workshop & Frontline!');

const waypoints = [
  { name: 'Corridor Start', pos: new Vec3(63.5, 65, -15) },
  { name: 'Corridor Mid', pos: new Vec3(63.5, 65, -30) },
  { name: 'Ridge South', pos: new Vec3(62.5, 65, -50) },
  { name: 'Ridge Mid', pos: new Vec3(62.5, 65, -70) },
  { name: 'Ridge North', pos: new Vec3(62.5, 65, -90) },
  { name: 'Ridge Bend', pos: new Vec3(61.5, 65, -100) },
  { name: 'Fortress Approach', pos: new Vec3(50.0, 65, -115) },
  { name: 'Fortress Workshop Bunker', pos: new Vec3(44.0, 65, -127) },
  { name: 'Covered Tunnel Mid', pos: new Vec3(44.0, 65, -145) },
  { name: 'Covered Tunnel North', pos: new Vec3(44.0, 65, -160) },
  { name: 'Frontline Blast Wall', pos: new Vec3(44.0, 65, -169) }
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`[WP ${i + 1}/${waypoints.length}] Moving to ${wp.name} at ${lib.fmt(wp.pos)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.pos.x, wp.pos.y, wp.pos.z, 1));
    console.log(`Reached ${wp.name} at ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Path note for ${wp.name}:`, e.message);
    await bot.lookAt(new Vec3(wp.pos.x, wp.pos.y + 1, wp.pos.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(1500);
    bot.clearControlStates();
  }

  // Pick up drops along tunnel
  try {
    await lib.pickup(6);
  } catch (e) {}
}

console.log('Final pos:', lib.fmt(bot.entity.position));
bot.chat(`delta: Reached frontline position ${lib.fmt(bot.entity.position)}!`);

// Scan dropped items at frontline
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

console.log('Current Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
