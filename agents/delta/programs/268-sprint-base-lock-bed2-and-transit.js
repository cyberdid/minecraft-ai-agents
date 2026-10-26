// programs/268-sprint-base-lock-bed2-and-transit.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(150);

// 1. Sprint East to base shelter at (294, 72, -54)
bot.chat('delta: Sprinting East across Overworld to base shelter...');
const overworldWPs = [
  new Vec3(140, 64, -30),
  new Vec3(190, 64, -40),
  new Vec3(240, 64, -48),
  new Vec3(280, 70, -52),
  new Vec3(292, 72, -54)
];

for (let i = 0; i < overworldWPs.length; i++) {
  if (isCancelled()) break;
  const wp = overworldWPs[i];
  console.log(`Heading to WP ${i + 1}/${overworldWPs.length}: ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 3));
  } catch (e) {
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(2500);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
  }
}

console.log('Arrived outside base at:', lib.fmt(bot.entity.position));

// 2. Step inside base and lock spawn on Bed 2 (294, 72, -56)
console.log('Entering base shelter through door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 1));
  await lib.goThroughDoor(294, 72, -54);
}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// Set spawn on Bed 2 explicitly
const bed2Pos = new Vec3(294, 72, -56);
const bed2 = bot.blockAt(bed2Pos);
if (bed2 && bot.isABed(bed2)) {
  console.log('Activating Bed 2 at (294, 72, -56)...');
  await bot.activateBlock(bed2);
  bot.chat('delta: Spawn locked on base Bed 2 at (294, 72, -56)! Decoupled from Bed 1.');
} else {
  console.log('Bed 2 not found at (294, 72, -56), finding nearest bed...');
  const anyBed = bot.findBlocks({ matching: b => bot.isABed(b), maxDistance: 6, count: 1 })[0];
  if (anyBed) {
    await bot.activateBlock(bot.blockAt(anyBed));
    bot.chat(`delta: Spawn locked on bed at ${lib.fmt(anyBed)}!`);
  }
}

// 3. Quick tools: collect 3 logs, craft wooden pick, mine stone, craft stone tools
console.log('Exiting to collect logs and craft tools...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

console.log('Collecting logs...');
try {
  await lib.collect('*_log', 3);
  await lib.craft('oak_planks', 8);
  await lib.craft('stick', 4);
  await lib.craft('wooden_pickaxe', 1);
  
  // Descend to mine shaft
  await bot.pathfinder.goto(new goals.GoalNear(304, 60, -55, 2));
  while (lib.count('cobblestone') < 5 && !isCancelled()) {
    const s = bot.findBlocks({ matching: b => b.name === 'stone', maxDistance: 4, count: 5 })[0];
    if (!s) break;
    await lib.dig(s.x, s.y, s.z);
    await lib.pickup(3);
  }
  await lib.craft('stone_pickaxe', 1);
  await lib.craft('stone_sword', 1);
  console.log('Stone tools crafted! Inv:', JSON.stringify(lib.inv()));
} catch (e) {
  console.log('Tools note:', e.message);
}

// 4. Enter Nether portal
console.log('Moving to Nether portal at (298, 72, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(298, 72, -54, 2));
} catch (e) {}

await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
bot.setControlState('jump', true);
bot.setControlState('forward', true);
await sleep(800);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Inside portal frame. Waiting for dimension transition...');
const start = Date.now();
while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 15000)) {
  await sleep(500);
}

console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension !== 'the_nether') {
  throw new Error('Failed to enter the_nether');
}

bot.chat(`delta: In Nether at ${lib.fmt(bot.entity.position)}! Sprinting strictly along z<=-7 safe trail to Spawner!`);

// 5. Strict Safe Trail (z <= -7, bypassing soul fire hill at z=-1..-4)
const netherSafeWPs = [
  new Vec3(50, 65, -7),
  new Vec3(60, 65, -7),
  new Vec3(63, 65, -7),
  new Vec3(63, 65, -15),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -145),
  new Vec3(44, 65, -158) // Frontline fortified position
];

for (let i = 0; i < netherSafeWPs.length; i++) {
  if (isCancelled()) break;
  const wp = netherSafeWPs[i];
  console.log(`Nether Safe WP ${i + 1}/${netherSafeWPs.length}: ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (e) {
    console.log(`Path note to ${lib.fmt(wp)}:`, e.message);
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y + 1, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(350);
    bot.setControlState('forward', false);
  }
}

console.log('Arrived at frontline! Pos:', lib.fmt(bot.entity.position));
bot.chat(`delta: United at frontline ${lib.fmt(bot.entity.position)} with team! Ready to storm the Blaze Spawner!`);
