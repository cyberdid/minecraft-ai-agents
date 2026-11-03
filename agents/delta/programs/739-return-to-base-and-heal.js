// programs/739-return-to-base-and-heal.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 739: RETURN TO BASE HOUSE & RESTORE HP ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.chat('delta: VICTORY! [Free the End] & [The Next Generation] ACHIEVED! Returning to Base House (293, 72, -55) to celebrate & restock!');

const baseDoor = new Vec3(294.0, 72.0, -54.0);
const baseInside = new Vec3(293.5, 72.0, -55.5);

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

// Intermediate waypoints back to Base:
const waypoints = [
  new Vec3(255.0, 70.0, -80.0),
  new Vec3(280.0, 71.0, -65.0),
  new Vec3(294.0, 72.0, -53.0)
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`Heading to Base WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
  } catch (e) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 10000 }); } catch (e2) {}
  }
}

// Enter through door
console.log('Entering Base House through door (294, 72, -54)...');
try {
  await lib.goThroughDoor(baseDoor.x, baseDoor.y, baseDoor.z);
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(baseInside.x, baseInside.y, baseInside.z, 1.0)); } catch (e2) {}
}

console.log('Delta inside Base House at:', lib.fmt(bot.entity.position));

// Check Base Chest
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    console.log('Base Chest items:');
    for (const it of chest.containerItems()) {
      console.log(`  * ${it.name} x${it.count}`);
    }
    // Withdraw food if available
    const food = chest.containerItems().find(i => ['cooked_beef', 'cooked_porkchop', 'bread'].includes(i.name));
    if (food && bot.food < 20) {
      console.log(`Withdrawing ${food.name}...`);
      await chest.withdraw(food.type, null, Math.min(food.count, 8));
    }
    chest.close();
  } catch (e) {}
}

// Eat if food
for (const f of ['cooked_beef', 'cooked_porkchop', 'bread']) {
  if (lib.count(f) > 0 && bot.food < 20) {
    try { await lib.eat(); } catch (e) {}
  }
}

// Sleep if dusk
const tod = bot.time.timeOfDay;
if (tod >= 12542 && tod <= 23460) {
  const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 4 });
  if (bed) {
    console.log('Sleeping in bed to restore 20/20 HP...');
    try {
      await bot.sleep(bed);
      while (bot.isSleeping && !isCancelled()) await sleep(500);
    } catch (e) {}
  }
}

console.log('\n=== Delta Status Report ===');
console.log('HP:', bot.health, 'Food:', bot.food, 'Time:', bot.time.timeOfDay);
console.log('Inventory:', JSON.stringify(lib.inv()));

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
