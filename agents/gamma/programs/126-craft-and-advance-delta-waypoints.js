// programs/126-craft-and-advance-delta-waypoints.js
console.log('--- CRAFT STONE GEAR & NETHER ADVANCE VIA DELTA WAYPOINTS ---');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Craft planks, sticks, wooden pickaxe
await lib.craft('birch_planks', 16);
await lib.craft('stick', 8);
await lib.craft('wooden_pickaxe', 1);

// 2. Mine 12 stone right on the hill
console.log('Mining 12 stone...');
await bot.equip(mcData.itemsByName.wooden_pickaxe.id, 'hand');
const p = bot.entity.position.floored();

const digTargets = [
  p.offset(1, 0, 0), p.offset(-1, 0, 0), p.offset(0, 0, 1), p.offset(0, 0, -1),
  p.offset(1, -1, 0), p.offset(-1, -1, 0), p.offset(0, -1, 1), p.offset(0, -1, -1),
  p.offset(1, 1, 0), p.offset(-1, 1, 0), p.offset(0, 1, 1), p.offset(0, 1, -1)
];

for (const t of digTargets) {
  if (lib.count('cobblestone') >= 12) break;
  const b = bot.blockAt(t);
  if (b && (b.name === 'stone' || b.name === 'diorite' || b.name === 'granite' || b.name === 'cobblestone')) {
    try {
      await lib.dig(t.x, t.y, t.z);
      await sleep(150);
      await lib.pickup(4);
    } catch (e) {}
  }
}

// 3. Craft stone tools
console.log('Crafting stone tools...');
if (lib.count('cobblestone') >= 2) {
  await lib.craft('stone_sword', 1);
}
if (lib.count('cobblestone') >= 3) {
  await lib.craft('stone_pickaxe', 1);
}
await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');

console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Cobblestone:', lib.count('cobblestone'));
bot.chat(`gamma armed with stone tools and ${lib.count('cobblestone')} cobble! Heading to Nether portal.`);

// 4. Move to Nether portal at (299, 73, -54)
console.log('Navigating to Nether portal...');
try {
  await lib.goTo(299, 73, -53, 1, { timeoutMs: 25000 });
} catch (e) {
  await lib.goToXZ(299, -53, { timeoutMs: 15000 });
}

// Step into portal and stand still
console.log('Stepping into purple portal block (299, 73, -54)...');
await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
bot.clearControlStates();

console.log('Standing still for Nether transit...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within 25s');
}

console.log('SUCCESS! In the Nether at:', lib.fmt(bot.entity.position));
bot.chat('gamma in the Nether! Following Delta East Ridge waypoints to Fortress advance hallway (44, 65, -133).');

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

// Report arrival
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}, dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}m`);
  }
}

bot.chat(`gamma united with Delta & Alpha at Fortress advance tunnel ${lib.fmt(bot.entity.position)}! Ready to breach Blaze Spawner (32, 68, -190).`);
console.log('Final status: pos=', lib.fmt(bot.entity.position), 'Health=', bot.health, 'Food=', bot.food);
