// programs/352-nether-spawner-assault.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Reset pathfinder
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();
await sleep(100);

// Ensure sword and shield equipped
await lib.equipArmor();
await lib.equipWeapon();
console.log('Offhand:', bot.inventory.slots[45]?.name, 'Mainhand:', bot.entity.heldItem?.name);

// 1. Enter Nether portal at (299.5, 73.0, -54.0)
console.log('Entering Nether portal at (299.5, 73.0, -54.0)...');
try {
  await lib.goTo(299, 73, -54, 0.5, { timeoutMs: 10000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(2000);
  bot.setControlState('forward', false);
}

// Await Nether dimension change
console.log('Awaiting Nether dimension change...');
const portalStart = Date.now();
while (!isCancelled() && bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 20000) {
  await sleep(250);
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension !== 'the_nether') {
  console.log('Nether transit incomplete, retry.');
  return;
}

bot.chat('delta: In Nether with SHIELD and stone sword! Sprinting to Spawner Balcony to unite with Alpha!');

// 2. Safe exit bunker at z = -7.0 / -8.0
await bot.lookAt(new Vec3(44.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('forward', false);

// 3. Sprint verified safe trail to Spawner Balcony
const safeTrail = [
  new Vec3(46, 65, -7),
  new Vec3(54, 65, -7),
  new Vec3(63, 64, -7),  // Excavated tunnel entrance at y=64
  new Vec3(63, 65, -20), // Inside tunnel
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127), // Fortress Workshop Outpost
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -163),
  new Vec3(44, 65, -174), // Spawner Bridgehead
  new Vec3(37, 65, -177), // Cross-bridge end
  new Vec3(34, 67, -187)  // Spawner Balcony deck
];

for (let i = 0; i < safeTrail.length; i++) {
  if (isCancelled()) break;
  const wp = safeTrail[i];
  if (bot.entity.position.distanceTo(wp) < 2.5) continue;
  
  console.log(`Trail WP ${i + 1}/${safeTrail.length}: ${lib.fmt(wp)}...`);
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 10000 });
  } catch (err) {
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(1200);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
  }
}

console.log('Arrived at Spawner Balcony deck! Pos:', lib.fmt(bot.entity.position));

// 4. Place blast roof blocks at y=67 over cross-bridge if open
const roofSpots = [
  new Vec3(38, 67, -176),
  new Vec3(37, 67, -176),
  new Vec3(37, 67, -177),
  new Vec3(36, 67, -185)
];
for (const spot of roofSpots) {
  const b = bot.blockAt(spot);
  if (b && (b.name === 'air' || b.name === 'cave_air')) {
    const filler = lib.count('cobblestone') > 0 ? 'cobblestone' : (lib.count('andesite') > 0 ? 'andesite' : null);
    if (!filler) break;
    try {
      console.log(`Placing blast roof ${filler} at ${lib.fmt(spot)}...`);
      await lib.place(filler, spot.x, spot.y, spot.z);
    } catch (e) {
      console.log(`Roof place note:`, e.message);
    }
  }
}

// 5. Engage Blazes from cover with shield & sword
const combatStart = Date.now();
while (Date.now() - combatStart < 45000 && !isCancelled() && bot.health > 8) {
  await lib.equipWeapon();
  await lib.equipArmor();

  const hostiles = lib.hostiles(10);
  const blazes = hostiles.filter(h => h.name === 'blaze');
  if (blazes.length > 0) {
    const target = blazes[0];
    const entity = Object.values(bot.entities).find(e => e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 5.0);
    if (entity) {
      console.log(`Striking Blaze at ${lib.fmt(entity.position)}...`);
      await bot.lookAt(entity.position.offset(0, 1.0, 0), true);
      await bot.attack(entity);
      await sleep(600);
      await bot.attack(entity);
    }
  }
  
  // Pick up drops
  try { await lib.pickup(8); } catch (e) {}
  await sleep(500);
}

try { await lib.pickup(10); } catch (e) {}

console.log('Combat round complete! Current Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
console.log('Blaze rods harvested:', lib.count('blaze_rod'));

bot.chat(`delta: Balcony assault round done! Rods: ${lib.count('blaze_rod')}, HP: ${bot.health}/20, cobble: ${lib.count('cobblestone')}`);
