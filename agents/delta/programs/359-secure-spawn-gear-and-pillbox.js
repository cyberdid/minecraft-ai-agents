// programs/359-secure-spawn-gear-and-pillbox.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'time:', bot.time.timeOfDay);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 1. Walk into base at (294, 72, -56) and lock spawn
console.log('Moving into base at (294, 72, -56)...');
try {
  await lib.goTo(294, 72, -56, 1, { timeoutMs: 10000 });
} catch (e) {
  console.log('goTo base note:', e.message);
}

// Lock spawn point at bed
try {
  await lib.setSpawn();
  console.log('Spawn point locked at base bed!');
  bot.chat('delta: Spawn point verified and locked at base bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 2. Check base chest at (293, 72, -57) for gear or blocks
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log(`Chest has ${items.length} item types:`);
    for (const i of items) {
      const n = i.name;
      if (n.includes('sword') || n.includes('pickaxe') || n.includes('shield') || n === 'cobblestone' || n.includes('cooked') || n === 'bread' || n.includes('planks') || n.includes('log')) {
        try { await chest.withdraw(i.type, null, i.count); console.log(`Withdrew ${n} x${i.count}`); } catch (err) {}
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest interaction note:', e.message);
  }
}

// Check ground drops near base
try {
  const drops = await lib.pickup(8);
  console.log('Base ground pickups:', drops);
} catch (e) {}

// 3. If no pickaxe, gather wood and craft wooden pickaxe
if (lib.count('*_pickaxe') === 0) {
  console.log('Gathering wood for pickaxe...');
  if (lib.count('*_log') === 0 && lib.count('*_planks') < 3) {
    try {
      await lib.collect('*_log', 1);
    } catch (e) {
      console.log('Collect log note:', e.message);
    }
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

// 4. Mine 20 cobblestone from quarry
if (lib.count('*_pickaxe') > 0 && lib.count('cobblestone') < 20) {
  const needed = 20 - lib.count('cobblestone');
  console.log(`Mining ${needed} cobblestone from quarry...`);
  try {
    await lib.collect('cobblestone', needed);
    console.log('Cobblestone count:', lib.count('cobblestone'));
  } catch (e) {
    console.log('Cobblestone collect note:', e.message);
  }
}

// 5. Craft stone tools: stone pickaxe and stone sword
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
  if (lib.count('stick') < 2) try { await lib.craft('stick', 4); } catch (e) {}
  try { await lib.craft('stone_pickaxe', 1); console.log('Stone pickaxe crafted!'); } catch (e) {}
}

if (lib.count('cobblestone') >= 2 && lib.count('*_sword') === 0) {
  if (lib.count('stick') < 1) try { await lib.craft('stick', 4); } catch (e) {}
  try { await lib.craft('stone_sword', 1); console.log('Stone sword crafted!'); } catch (e) {}
}

const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) try { await bot.equip(sword, 'hand'); } catch (e) {}

try { await lib.equipArmor(); } catch (e) {}

console.log(`Delta prepared: cobble=${lib.count('cobblestone')}, sword=${lib.count('*_sword')}, pick=${lib.count('*_pickaxe')}`);

// 6. Enter Nether portal at (299.5, 73.0, -54.0)
console.log('Moving into Nether portal at (299.5, 73.0, -54.0)...');
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

bot.chat(`delta: In Nether with stone sword & ${lib.count('cobblestone')} cobble! Advancing to Spawner Pillbox!`);

// 7. Safe exit bunker at z = -7.0
await bot.lookAt(new Vec3(44.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('forward', false);

// 8. Sprint verified safe trail to Spawner Bridgehead
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

console.log('Arrived at Balcony Approach! Pos:', lib.fmt(bot.entity.position));

// 9. Construct Pillbox Shield Wall from safe standing position at (36, y, -185)
const feetY = Math.floor(bot.entity.position.y);
console.log(`Standing at feet Y = ${feetY}. Building pillbox barrier towards Spawner (32, 68, -190)...`);

// Barrier blocks to place
const barrierSpots = [
  new Vec3(35, feetY, -185),      // West lower block
  new Vec3(35, feetY + 1, -185),  // West upper block (blocks direct sight from Spawner)
  new Vec3(35, feetY, -186),      // NW corner lower block
  new Vec3(36, feetY, -186),      // North lower waist block
  new Vec3(36, feetY + 2, -185),  // Roof directly overhead
  new Vec3(36, feetY + 2, -186)   // Roof over slit
];

for (const spot of barrierSpots) {
  const b = bot.blockAt(spot);
  if (b && (b.name === 'air' || b.name === 'cave_air')) {
    const filler = lib.count('cobblestone') > 0 ? 'cobblestone' : (lib.count('andesite') > 0 ? 'andesite' : (lib.count('*_planks') > 0 ? 'oak_planks' : null));
    if (!filler) {
      console.log('No more filler blocks!');
      break;
    }
    try {
      console.log(`Placing pillbox block ${filler} at ${lib.fmt(spot)}...`);
      await lib.place(filler, spot.x, spot.y, spot.z);
    } catch (e) {
      console.log(`Pillbox place note at ${lib.fmt(spot)}:`, e.message);
    }
  } else {
    console.log(`Block at ${lib.fmt(spot)} is already ${b?.name}`);
  }
}

// 10. Vacuum up all dropped gear at (35..36, -185..-187)
console.log('Vacuuming up dropped gear through firing slit...');
try {
  const picked = await lib.pickup(6);
  console.log('Picked up drops:', picked);
} catch (e) {}

// Equip any picked up armor / shield / sword
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// 11. Engage Blazes from safety of the pillbox through the firing slit!
console.log('Engaging Blazes through firing slit...');
const combatStart = Date.now();
while (Date.now() - combatStart < 35000 && !isCancelled() && bot.health > 8) {
  await lib.equipWeapon();
  await lib.equipArmor();

  const hostiles = lib.hostiles(8);
  const blazes = hostiles.filter(h => h.name === 'blaze');
  if (blazes.length > 0) {
    const target = blazes[0];
    const entity = Object.values(bot.entities).find(e => e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 5.0);
    if (entity) {
      console.log(`Striking Blaze at ${lib.fmt(entity.position)} through slit!`);
      await bot.lookAt(entity.position.offset(0, 1.0, 0), true);
      await bot.attack(entity);
      await sleep(600);
      await bot.attack(entity);
    }
  }
  
  // Continuous drop pickup
  try { await lib.pickup(6); } catch (e) {}
  await sleep(600);
}

try { await lib.pickup(8); } catch (e) {}

console.log('Assault round complete! Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
console.log('Blaze rods harvested:', lib.count('blaze_rod'));

bot.chat(`delta: Spawner Pillbox secured! Blaze Rods: ${lib.count('blaze_rod')}, HP: ${bot.health}/20, cobble: ${lib.count('cobblestone')}`);
