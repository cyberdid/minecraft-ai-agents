console.log('=== PROGRAM 686: DELTA SPRINT TO BASE & REUNITE ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.chat('delta: Respawned in Overworld at 20/20 HP & Food! Sprinting to Base (293, 72, -55) to join Beta for Milestone 10!');

// 1. Equip iron armor and shield
try { await lib.equipArmor(); } catch (e) {}

// 2. Sprint to Base Door at (294, 72, -54)
const baseDoor = new Vec3(294, 72, -54);
const baseInside = new Vec3(293.5, 72.0, -56.0);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

console.log(`Pathfinding to Base Door at ${lib.fmt(baseDoor)}...`);
try {
  await bot.pathfinder.goto(new goals.GoalNear(baseDoor.x, baseDoor.y, baseDoor.z, 2.0));
} catch (e) {
  console.log('Pathfinder notice, using goToXZ fallback:', e.message);
  try {
    await lib.goToXZ(baseDoor.x, baseDoor.z, { timeoutMs: 25000 });
  } catch (e2) {}
}

console.log('Near base door! Entering through door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('goThroughDoor notice:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(baseInside.x, baseInside.y, baseInside.z, 0.8));
  } catch (e2) {}
}

console.log('Inside Base! Position:', lib.fmt(bot.entity.position));

// 3. Set spawn at bed
const bedBlock = bot.findBlock({
  matching: b => b && b.name.includes('bed'),
  maxDistance: 5
});
if (bedBlock) {
  console.log(`Found bed at ${lib.fmt(bedBlock.position)}`);
}

// 4. Night sleeping check
const time = bot.time.timeOfDay;
console.log(`Time of day: ${time}, night: ${time >= 12542 && time <= 23460}`);
if (time >= 12542 && time <= 23460 && bedBlock) {
  console.log('Night is active! Sleeping in bed...');
  try {
    await bot.sleep(bedBlock);
    bot.chat('delta: Sleeping in bed to skip night!');
    await sleep(5500);
  } catch (err) {
    console.log('Sleep notice:', err.message);
  }
}

// 5. Check nearby teammates
const teammates = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log(`Teammates inside/near base: ${teammates.length}`);
for (const tm of teammates) {
  console.log(`- ${tm.username} at ${lib.fmt(tm.position)} (dist: ${bot.entity.position.distanceTo(tm.position).toFixed(1)}m)`);
}

// 6. Inspect Base Chest
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const cItems = chest.containerItems();
    console.log('Base Chest contents:');
    for (const it of cItems) {
      console.log(`  ${it.name} x${it.count}`);
    }
    chest.close();
  } catch (e) {
    console.log('Chest inspect error:', e.message);
  }
}

console.log('Delta Inventory:', lib.inv());
bot.chat(`delta: Secure in Overworld base! HP: ${bot.health}/20, Food: ${bot.food}/20.`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay,
  inv: lib.inv()
};
