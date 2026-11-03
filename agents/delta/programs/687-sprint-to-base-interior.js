console.log('=== PROGRAM 687: SPRINT TO BASE INTERIOR ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Equip armor & weapon
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
moves.maxDropDown = 3;
bot.pathfinder.setMovements(moves);

// Surface waypoints to base
const waypoints = [
  { x: 170, y: 63, z: -35 },
  { x: 210, y: 65, z: -40 },
  { x: 250, y: 68, z: -48 },
  { x: 285, y: 72, z: -52 },
  { x: 294, y: 72, z: -53 }
];

console.log('Sprinting surface waypoints to base...');
for (let i = 0; i < waypoints.length && !checkCancelled(); i++) {
  const wp = waypoints[i];
  if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 5.0) continue;

  console.log(`Heading to WP ${i + 1}/${waypoints.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 3.0));
  } catch (err) {
    console.log(`Pathfinder error on WP ${i + 1}, using goToXZ:`, err.message);
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 12000 });
    } catch (e2) {}
  }
}

// Approach door at (294, 72, -54)
console.log('Arriving at base exterior. Current pos:', lib.fmt(bot.entity.position));
try {
  await lib.goToXZ(294, -53, { timeoutMs: 8000 });
} catch (e) {}

// Check door
const doorBlock = bot.blockAt(new Vec3(294, 72, -54));
console.log('Door block at (294, 72, -54):', doorBlock ? doorBlock.name : 'null');

if (doorBlock && doorBlock.name.includes('door')) {
  console.log('Going through door...');
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    console.log('goThroughDoor error:', e.message);
  }
} else {
  // If no door or open doorway, step directly inside
  console.log('Stepping inside base...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -56.0, 0.8));
  } catch (e) {}
}

console.log('Inside Base! Final pos:', lib.fmt(bot.entity.position));

// If night time, sleep immediately
const curTime = bot.time.timeOfDay;
console.log(`Time of day: ${curTime}, night in: ${Math.round((12542 - (curTime % 24000)) / 20)}s`);
if (curTime >= 12542 && curTime <= 23460) {
  const bedBlock = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 5 });
  if (bedBlock) {
    console.log(`Night active! Sleeping in bed at ${lib.fmt(bedBlock.position)}...`);
    try {
      await bot.sleep(bedBlock);
      bot.chat('delta: Sleeping in bed to skip night!');
      await sleep(6000);
    } catch (e) {
      console.log('Sleep notice:', e.message);
    }
  }
}

// Check Base Chest
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log('Base Chest items:');
    for (const it of items) {
      console.log(`  ${it.name} x${it.count}`);
    }
    chest.close();
  } catch (e) {
    console.log('Chest inspect error:', e.message);
  }
}

// Log inventory and teammates
const teammates = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log(`Teammates nearby: ${teammates.length}`);
for (const tm of teammates) {
  console.log(`- ${tm.username} at ${lib.fmt(tm.position)}`);
}

bot.chat(`delta: Safely inside base house! HP: ${bot.health}/20, Food: ${bot.food}/20.`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay,
  inv: lib.inv()
};
