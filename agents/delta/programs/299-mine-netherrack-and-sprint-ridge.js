// programs/299-mine-netherrack-and-sprint-ridge.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// Dimension guard
if (!String(bot.game.dimension).includes('nether')) {
  console.log('Not in Nether! Aborting.');
  return;
}

bot.pathfinder.stop();
await sleep(100);

// 1. Gather 16 netherrack from safe adjacent blocks
console.log('Mining 16 netherrack blocks for wall construction...');
const netherracks = bot.findBlocks({
  matching: b => b.name === 'netherrack',
  maxDistance: 4,
  count: 16
});

for (const p of netherracks) {
  // Don't dig the floor under feet
  if (p.y < bot.entity.position.y && p.x === Math.floor(bot.entity.position.x) && p.z === Math.floor(bot.entity.position.z)) continue;
  const b = bot.blockAt(p);
  if (b) {
    try {
      await bot.dig(b);
    } catch (e) {}
  }
}
console.log('Netherrack count:', lib.count('netherrack'));

bot.chat(`delta: Gathered ${lib.count('netherrack')} netherrack! Sprinting along East Ridge to Fortress Workshop & Spawner Front!`);

// 2. Strict waypoints along East Ridge to Fortress Bunker and Advance Tunnel
const waypoints = [
  { name: 'Ridge South', pos: new Vec3(62.5, 66, -30) },
  { name: 'Ridge Mid-South', pos: new Vec3(62.5, 66, -55) },
  { name: 'Ridge Mid-North', pos: new Vec3(62.5, 67, -80) },
  { name: 'Ridge North Bend', pos: new Vec3(61.5, 66, -100) },
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
    await lib.goTo(wp.pos.x, wp.pos.y, wp.pos.z, 2, { timeoutMs: 14000 });
    console.log(`Reached ${wp.name} at ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    try {
      await lib.goToXZ(wp.pos.x, wp.pos.z, { timeoutMs: 10000 });
      console.log(`Reached ${wp.name} via goToXZ at ${lib.fmt(bot.entity.position)}`);
    } catch (e2) {
      console.log(`Nav note for ${wp.name}:`, e2.message);
    }
  }

  // Pick up any dropped items on the way
  try {
    await lib.pickup(6);
  } catch (e) {}
}

console.log('Arrived at frontline! Pos:', lib.fmt(bot.entity.position));
bot.chat(`delta: Arrived at frontline bunker ${lib.fmt(bot.entity.position)} with ${lib.count('netherrack')} blocks! Ready to build West wall & breach Spawner!`);

// Check nearby drops
const drops = Object.values(bot.entities).filter(e => e && (e.name === 'item' || e.type === 'object') && bot.entity.position.distanceTo(e.position) < 15);
console.log(`Drops within 15m: ${drops.length}`);
for (const d of drops) {
  console.log(`Drop at ${lib.fmt(d.position)} (dist: ${bot.entity.position.distanceTo(d.position).toFixed(1)}m)`);
  if (bot.entity.position.distanceTo(d.position) < 8) {
    try {
      await lib.pickup(8);
    } catch (e) {}
  }
}

// Equip best weapon and armor
try {
  await lib.equipArmor();
  await lib.equipWeapon();
} catch (e) {}

console.log('Current Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
