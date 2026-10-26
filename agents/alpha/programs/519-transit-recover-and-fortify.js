// programs/519-transit-recover-and-fortify.js
console.log('=== Program 519: Transit Nether, Recover 97 Cobble & Fortify ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(100);

// 1. Ensure shield is in offhand
await lib.equipArmor();

// 2. Step outside base door
console.log('Exiting base door...');
await passDoorOut();

// 3. Approach Nether portal at (299, 73, -54)
console.log('Stepping into Nether portal...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(299.5, 72.0, -52.5, 1));
} catch (e) {
  console.log('Portal pathfinder note:', e.message);
}

await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
bot.setControlState('jump', true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Waiting for dimension shift to the_nether...');
const start = Date.now();
while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 15000)) {
  await sleep(500);
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to enter the_nether. Current dim: ${bot.game.dimension}`);
}

console.log('Entered the_nether! Alpha pos:', lib.fmt(bot.entity.position));
bot.chat('alpha: In Nether with SHIELD in offhand! Sprinting to z=-158 to recover 97 cobble and seal West blast wall!');

// 4. Step out of portal into Nether bunker
await bot.lookAt(new Vec3(40.5, 65.0, -5.0), true);
bot.setControlState('forward', true);
await sleep(600);
bot.setControlState('forward', false);

// 5. Sprint through covered East Ridge trail to fortress
const waypoints = [
  new Vec3(50, 65, -6),
  new Vec3(63, 65, -5),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -157)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  // Pitch gaze low (y=64) to prevent Enderman aggro
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (e) {
    console.log(`WP note to ${lib.fmt(wp)}: ${e.message}`);
    await bot.lookAt(new Vec3(wp.x + 0.5, 64.0, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(400);
    bot.setControlState('forward', false);
  }
}

console.log('Arrived at fortress front:', lib.fmt(bot.entity.position));

// 6. Walk forward to z=-158 to recover dropped gear
console.log('Picking up dropped items at z=-158...');
await bot.lookAt(new Vec3(44.5, 64.0, -158.5), true);
bot.setControlState('forward', true);
await sleep(500);
bot.setControlState('forward', false);
const picked = await lib.pickup(8);
console.log(`Picked up items: ${picked}. Cobblestone count: ${lib.count('cobblestone')}`);

// 7. Equip stone sword and armor/shield
await lib.equipArmor();
await lib.equipWeapon();

// 8. Place West blast wall along x=43 and north baffle
console.log('Placing West blast wall at x=43...');
const wallBlocks = [
  { x: 43, y: 65, z: -157 },
  { x: 43, y: 66, z: -157 },
  { x: 43, y: 65, z: -158 },
  { x: 43, y: 66, z: -158 },
  { x: 43, y: 65, z: -159 },
  { x: 43, y: 66, z: -159 },
  { x: 44, y: 65, z: -160 } // North baffle
];

for (const b of wallBlocks) {
  if (lib.count('cobblestone') < 2) break;
  try {
    const existing = bot.blockAt(new Vec3(b.x, b.y, b.z));
    if (!existing || existing.name === 'air') {
      await lib.place('cobblestone', b.x, b.y, b.z);
      console.log(`Placed cobblestone at (${b.x}, ${b.y}, ${b.z})!`);
    }
  } catch (err) {
    console.log(`Place (${b.x}, ${b.y}, ${b.z}) note: ${err.message}`);
  }
}

bot.chat(`alpha: Frontline fortified! West blast wall secured at z=-158..-160! Holding ${lib.count('cobblestone')} cobble!`);

// 9. Scan teammates and hostiles
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'alpha') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

const hostiles = lib.hostiles(24);
console.log(`Hostiles nearby (${hostiles.length}):`);
for (const h of hostiles) {
  console.log(`  ${h.name} at ${lib.fmt(h.pos)} (dist ${h.dist.toFixed(1)}m)`);
}

console.log('=== Final Status ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Tools & Gear:', JSON.stringify(lib.tools()));
console.log('Inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));
