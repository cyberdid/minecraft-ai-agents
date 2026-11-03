// programs/358-frontline-pillbox-and-blaze-harvest.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'time:', bot.time.timeOfDay);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 1. Gather 1 log for wooden pickaxe
if (lib.count('*_pickaxe') === 0) {
  console.log('Mining 1 log from tree...');
  try {
    await lib.collect('*_log', 1);
  } catch (e) {
    console.log('Log collect note:', e.message);
  }
  
  const log = bot.inventory.items().find(i => i.name.endsWith('_log'));
  if (log) {
    try { await lib.craft(log.name.replace('_log', '_planks'), 4); } catch (e) {}
  }
  if (lib.count('stick') < 2) {
    try { await lib.craft('stick', 4); } catch (e) {}
  }
  if (lib.count('*_planks') >= 3) {
    try { await lib.craft('wooden_pickaxe', 1); console.log('Wooden pickaxe crafted!'); } catch (e) {}
  }
}

// 2. Mine 16 cobblestone
if (lib.count('*_pickaxe') > 0 && lib.count('cobblestone') < 16) {
  const needed = 16 - lib.count('cobblestone');
  console.log(`Mining ${needed} cobblestone...`);
  try {
    await lib.collect('cobblestone', needed);
    console.log('Cobblestone count:', lib.count('cobblestone'));
  } catch (e) {
    console.log('Cobblestone collect note:', e.message);
  }
}

// 3. Craft stone sword
if (lib.count('cobblestone') >= 2 && lib.count('*_sword') === 0) {
  if (lib.count('stick') < 1) try { await lib.craft('stick', 4); } catch (e) {}
  try {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted!');
  } catch (e) {}
}

const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) try { await bot.equip(sword, 'hand'); } catch (e) {}

console.log(`Prepared gear: cobble=${lib.count('cobblestone')}, sword=${lib.count('*_sword')}`);

// 4. Enter Nether portal at (299.5, 73.0, -54.0)
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
while (!isCancelled() && bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 15000) {
  await sleep(250);
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension !== 'the_nether') {
  console.log('Nether transit incomplete, retry.');
  return;
}

bot.chat(`delta: Entering Nether with ${lib.count('cobblestone')} cobble & stone sword to seal Spawner Pillbox!`);

// 5. Safe exit bunker at z = -7.0
await bot.lookAt(new Vec3(44.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('forward', false);

// 6. Sprint verified safe trail to Spawner Balcony
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
  new Vec3(37, 65, -177), // Cross-bridge end (under roof!)
  new Vec3(36, 67, -185)  // Spawner Balcony approach under roof
];

for (let i = 0; i < safeTrail.length; i++) {
  if (isCancelled()) break;
  const wp = safeTrail[i];
  if (bot.entity.position.distanceTo(wp) < 2.5) continue;
  
  console.log(`Trail WP ${i + 1}/${safeTrail.length}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 8000 });
  } catch (err) {
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(1200);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
  }
}

console.log('Arrived under blast roof! Pos:', lib.fmt(bot.entity.position));

// 7. Construct Frontline Pillbox Wall between bot and Spawner (32, 68, -190)
// Place protective wall blocks at x=35, z=-186..-187 while standing safe at x=36
const barrierSpots = [
  new Vec3(35, 68, -186),
  new Vec3(35, 68, -187),
  new Vec3(35, 69, -187) // leaves (35, 69, -186) open as 1-block waist/eye slit!
];

for (const spot of barrierSpots) {
  const b = bot.blockAt(spot);
  if (b && (b.name === 'air' || b.name === 'cave_air')) {
    const filler = lib.count('cobblestone') > 0 ? 'cobblestone' : (lib.count('andesite') > 0 ? 'andesite' : null);
    if (!filler) break;
    try {
      console.log(`Placing pillbox barrier ${filler} at ${lib.fmt(spot)}...`);
      await lib.place(filler, spot.x, spot.y, spot.z);
    } catch (e) {
      console.log(`Pillbox place note at ${lib.fmt(spot)}:`, e.message);
    }
  }
}

// 8. Pick up all dropped gear lying at (35, 68, -186)
try {
  const picked = await lib.pickup(8);
  console.log('Picked up dropped items:', picked);
} catch (e) {}

// Equip best weapons/armor
try { await lib.equipArmor(); await lib.equipWeapon(); } catch (e) {}

// 9. Slay Blazes safely through the firing slit
const combatStart = Date.now();
while (Date.now() - combatStart < 45000 && !isCancelled() && bot.health > 8) {
  await lib.equipWeapon();
  await lib.equipArmor();

  const hostiles = lib.hostiles(8);
  const blazes = hostiles.filter(h => h.name === 'blaze');
  if (blazes.length > 0) {
    const target = blazes[0];
    const entity = Object.values(bot.entities).find(e => e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 5.0);
    if (entity) {
      console.log(`Striking Blaze at ${lib.fmt(entity.position)} through slit...`);
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

console.log('Assault complete! Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
console.log('Blaze rods harvested:', lib.count('blaze_rod'));

bot.chat(`delta: Pillbox secured! Blaze Rods: ${lib.count('blaze_rod')}, HP: ${bot.health}/20, cobble: ${lib.count('cobblestone')}`);
