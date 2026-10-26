// programs/134-mine-cobble-and-advance-nether.js
console.log('--- MINE COBBLESTONE & ADVANCE TO FORTRESS TUNNEL ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));
console.log('Inv:', JSON.stringify(lib.inv()));

// 1. Step outside base to stone mining area near (298, 72, -48)
console.log('Moving outside to (298, 72, -48)...');
try {
  await lib.goTo(298, 72, -48, 1, { timeoutMs: 20000 });
} catch (e) {
  console.log('goTo 298, 72, -48 note:', e.message);
}

// 2. Mine cobblestone until we have at least 32 cobblestone
console.log('Current cobblestone:', lib.count('cobblestone'));
if (lib.count('cobblestone') < 32) {
  const needed = 32 - lib.count('cobblestone');
  console.log(`Collecting ${needed} stone...`);
  try {
    await lib.collect('stone', needed, { maxDistance: 16 });
  } catch (e) {
    console.log('collect stone note:', e.message);
  }
}

console.log('Cobblestone after mining:', lib.count('cobblestone'));
console.log('Inventory:', JSON.stringify(lib.inv()));

// 3. Craft shield if we have iron and planks
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  try {
    console.log('Crafting shield...');
    await lib.craft('shield', 1);
    await lib.equipArmor();
  } catch (e) {
    console.log('Shield craft error:', e.message);
  }
}

// Equip stone sword
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

// 4. Move to Nether portal at (299, 73, -54)
console.log('Moving to Nether portal (299, 73, -54)...');
try {
  await lib.goTo(299, 73, -53, 1, { timeoutMs: 20000 });
} catch (e) {
  await lib.goToXZ(299, -53, { timeoutMs: 15000 });
}

// Step into portal and stand still
console.log('Stepping into portal frame...');
await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
bot.clearControlStates();

console.log('Waiting for Nether transit (standing still)...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  console.log('Dimension currently:', bot.game.dimension);
  throw new Error('Did not transition to Nether within 25s');
}

console.log('SUCCESS! In the Nether at:', lib.fmt(bot.entity.position));
bot.chat('gamma entered the Nether! Following safe East Ridge trail to Fortress advance hallway (44, 65, -133).');

// 5. Follow Delta tested East Ridge waypoints
const deltaWaypoints = [
  new Vec3(63, 64, -5),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(54, 65, -90),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -133)
];

for (let i = 0; i < deltaWaypoints.length; i++) {
  const wp = deltaWaypoints[i];
  console.log(`Navigating to Waypoint ${i + 1}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 25000 });
    console.log(`Reached Waypoint ${i + 1} at ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`WP ${i + 1} note: ${e.message}`);
  }
}

console.log('Final position in Nether:', lib.fmt(bot.entity.position));
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}, dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}m`);
  }
}

bot.chat(`gamma joined team at Fortress advance hallway ${lib.fmt(bot.entity.position)}! Cobblestone=${lib.count('cobblestone')}, HP=${bot.health}. Ready for Blaze Spawner breach (32, 68, -190)!`);
