// programs/368-dawn-gear-and-pillbox-reinforce.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'time:', bot.time.timeOfDay);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 1. Gather 2 logs from nearby tree
console.log('Gathering 2 logs...');
try {
  await lib.collect('*_log', 2);
  console.log('Logs collected! Count:', lib.count('*_log'));
} catch (e) {
  console.log('Collect log error:', e.message);
}

// 2. Craft planks, sticks, wooden pickaxe
const logs = bot.inventory.items().filter(i => i.name.endsWith('_log'));
for (const l of logs) {
  try { await lib.craft(l.name.replace('_log', '_planks'), l.count * 4); } catch (e) {}
}
if (lib.count('stick') < 2) try { await lib.craft('stick', 4); } catch (e) {}
if (lib.count('*_pickaxe') === 0 && lib.count('*_planks') >= 3) {
  try {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Wooden pickaxe crafted!');
  } catch (e) {}
}

const wPick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (wPick) try { await bot.equip(wPick, 'hand'); } catch (e) {}

// 3. Mine 20 cobblestone from quarry shaft at (302, 71, -44)
if (lib.count('*_pickaxe') > 0 && lib.count('cobblestone') < 20) {
  const needed = 20 - lib.count('cobblestone');
  console.log(`Mining ${needed} cobblestone from quarry...`);
  try {
    await lib.collect('cobblestone', needed);
    console.log('Cobblestone count:', lib.count('cobblestone'));
  } catch (e) {
    console.log('Collect cobble error:', e.message);
  }
}

// 4. Craft stone tools: stone_pickaxe and stone_sword
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
  if (lib.count('stick') < 2) try { await lib.craft('stick', 4); } catch (e) {}
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Stone pickaxe crafted!');
  } catch (e) {}
}

if (lib.count('cobblestone') >= 2 && lib.count('*_sword') === 0) {
  if (lib.count('stick') < 1) try { await lib.craft('stick', 4); } catch (e) {}
  try {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted!');
  } catch (e) {}
}

const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) try { await bot.equip(sword, 'hand'); } catch (e) {}

console.log(`Delta armed: cobble=${lib.count('cobblestone')}, sword=${lib.count('*_sword')}, planks=${lib.count('*_planks')}`);

// 5. Enter Nether portal at (299.5, 73.0, -54.0)
console.log('Moving into Nether portal at (299.5, 73.0, -54.0)...');
try {
  await lib.goTo(299, 73, -54, 0.5, { timeoutMs: 12000 });
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

bot.chat(`delta: Entering Nether with stone sword & ${lib.count('cobblestone')} cobble! Advancing to Spawner Pillbox!`);

// 6. Safe exit bunker at z = -7.0
await bot.lookAt(new Vec3(44.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('forward', false);

// 7. Sprint verified safe trail to Spawner Bridgehead
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

console.log('Arrived at Balcony Approach under roof! Pos:', lib.fmt(bot.entity.position));

// 8. Ensure stationary pillbox barrier at (35..36, feetY, -185..-186)
const feetY = Math.floor(bot.entity.position.y);
console.log(`Standing at feet Y = ${feetY}. Reinforcing pillbox towards Spawner (32, 68, -190)...`);

const barrierSpots = [
  new Vec3(35, feetY, -185),      // West lower wall (guardrail)
  new Vec3(35, feetY + 1, -185),  // West upper wall
  new Vec3(35, feetY, -186),      // NW corner lower wall
  new Vec3(36, feetY, -186),      // North lower waist block
  new Vec3(36, feetY + 2, -185),  // Overhead blast roof
  new Vec3(36, feetY + 2, -186)   // Overhead blast roof extension
];

for (const spot of barrierSpots) {
  const b = bot.blockAt(spot);
  if (b && (b.name === 'air' || b.name === 'cave_air')) {
    const filler = lib.count('cobblestone') > 0 ? 'cobblestone' : (lib.count('*_planks') > 0 ? 'birch_planks' : (lib.count('dirt') > 0 ? 'dirt' : null));
    if (!filler) break;
    try {
      console.log(`Placing pillbox block ${filler} at ${lib.fmt(spot)}...`);
      await lib.place(filler, spot.x, spot.y, spot.z);
    } catch (e) {
      console.log(`Pillbox place note at ${lib.fmt(spot)}:`, e.message);
    }
  }
}

// 9. Vacuum up dropped gear (shields, swords, blaze rods)
console.log('Vacuuming dropped items...');
try {
  const picked = await lib.pickup(6);
  if (picked > 0) console.log(`Picked up ${picked} drops!`);
} catch (e) {}

try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// 10. Stationary combat loop: strike Blazes through firing slit WITHOUT moving forward
console.log('Stationary combat loop active...');
const combatStart = Date.now();
let rods = lib.count('blaze_rod');

while (Date.now() - combatStart < 40000 && !isCancelled() && bot.health > 8) {
  await lib.equipWeapon();
  await lib.equipArmor();

  const blazes = Object.values(bot.entities)
    .filter(e => e && e.name === 'blaze' && e.position && bot.entity.position.distanceTo(e.position) <= 5.5)
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  if (blazes.length > 0) {
    const target = blazes[0];
    console.log(`Striking Blaze at ${lib.fmt(target.position)} through firing slit!`);
    await bot.lookAt(target.position.offset(0, 1.0, 0), true);
    await bot.attack(target);
    await sleep(550);
    await bot.attack(target);
  }

  // Vacuum drops without moving feet
  try { await lib.pickup(5); } catch (e) {}

  const currentRods = lib.count('blaze_rod');
  if (currentRods !== rods) {
    rods = currentRods;
    console.log(`>>> BLAZE ROD HARVESTED! Total: ${rods} <<<`);
    bot.chat(`delta: Harvested Blaze Rod! Total: ${rods}/8! HP: ${bot.health}/20`);
  }

  await sleep(400);
}

try { await lib.pickup(8); } catch (e) {}

console.log('Assault round complete! Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
console.log('Blaze rods harvested:', lib.count('blaze_rod'));

bot.chat(`delta: Pillbox engagement complete! Blaze Rods: ${lib.count('blaze_rod')}, HP: ${bot.health}/20, cobble: ${lib.count('cobblestone')}`);
