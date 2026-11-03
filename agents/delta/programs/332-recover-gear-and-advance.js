// programs/332-recover-gear-and-advance.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
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

// 1. Safe bunker exit strictly at z = -8.0
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
  try { await lib.goTo(wp.x, wp.y, wp.z, 1, { timeoutMs: 8000 }); } catch (e) {}
}

// 3. Move along corridor towards gear drop at (62.4, 65.0, -64.8)
const trailToDrop = [
  new Vec3(63.0, 65.0, -15),
  new Vec3(63.0, 65.0, -30),
  new Vec3(62.0, 65.0, -50),
  new Vec3(62.4, 65.0, -64.8)
];

for (const wp of trailToDrop) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1));
  } catch (e) {
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(1500);
    bot.clearControlStates();
  }
}

console.log('At gear recovery spot! Pos:', lib.fmt(bot.entity.position));

// 4. Pickup dropped stone sword, pickaxe, cobblestone
try {
  await lib.pickup(10);
  console.log('Picked up drops! Inventory:');
  for (const i of bot.inventory.items()) {
    console.log(`  ${i.name} x${i.count}`);
  }
} catch (e) {}

// Equip stone_sword
const sword = bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (sword) {
  await bot.equip(sword, 'hand');
  console.log('Equipped weapon:', sword.name);
}

// Check for hostile skeleton nearby
const hostiles = Object.values(bot.entities).filter(e => e && e !== bot.entity && (e.name === 'skeleton' || e.name === 'wither_skeleton') && bot.entity.position.distanceTo(e.position) < 12);
if (hostiles.length > 0 && sword) {
  console.log(`Hostile detected: ${hostiles[0].name} at dist ${bot.entity.position.distanceTo(hostiles[0].position).toFixed(1)}m, engaging...`);
  try {
    await lib.fight(10, 8);
    console.log('Hostile defeated!');
  } catch (fe) {
    console.log('Fight note:', fe.message);
  }
}

// 5. Continue along corridor to Fortress Workshop & Frontline
const trailToFront = [
  new Vec3(62.0, 65.0, -80),
  new Vec3(62.0, 65.0, -90),
  new Vec3(61.0, 65.0, -100),
  new Vec3(50.0, 65.0, -115),
  new Vec3(44.0, 65.0, -127), // Fortress Workshop Bunker
  new Vec3(44.0, 65.0, -145), // Covered Advance Tunnel
  new Vec3(44.0, 65.0, -160),
  new Vec3(44.0, 65.0, -169), // Frontline Blast Wall
  new Vec3(38.0, 65.0, -176)  // Fortified Cross-Bridge
];

for (const wp of trailToFront) {
  if (isCancelled()) break;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1));
  } catch (e) {
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(1500);
    bot.clearControlStates();
  }
  try { await lib.pickup(6); } catch (e) {}
}

console.log('Arrived at fortified cross-bridge! Pos:', lib.fmt(bot.entity.position));
bot.chat(`delta: Reached fortified cross-bridge ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble & weapon! Ready to breach Spawner!`);
