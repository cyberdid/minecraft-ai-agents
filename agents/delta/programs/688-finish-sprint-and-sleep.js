console.log('=== PROGRAM 688: FINISH SPRINT TO BASE & SLEEP ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Enable sprint movements
const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
moves.maxDropDown = 3;
bot.pathfinder.setMovements(moves);

// Sprint straight to door area (294, 72, -53)
console.log('Sprinting final 68m to base door (294, 72, -53)...');
try {
  await lib.goToXZ(294, -53, { timeoutMs: 20000 });
} catch (e) {
  console.log('goToXZ notice:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1.5));
  } catch (e2) {}
}

console.log('At base door area! Pos:', lib.fmt(bot.entity.position));

// Enter through door
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('goThroughDoor error, trying goto interior:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -56.0, 0.8));
  } catch (e2) {}
}

console.log('Inside Base! Pos:', lib.fmt(bot.entity.position));

// Find bed
const bedBlock = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
if (bedBlock) {
  console.log(`Located bed at ${lib.fmt(bedBlock.position)}`);
}

// Wait for night if needed (time 12542)
while (!checkCancelled()) {
  const t = bot.time.timeOfDay;
  const isNight = (t >= 12542 && t <= 23460);
  console.log(`Current timeOfDay: ${t}, isNight: ${isNight}`);

  if (isNight && bedBlock) {
    console.log('Attempting sleep in bed...');
    try {
      await bot.sleep(bedBlock);
      bot.chat('delta: Sleeping in base bed to pass night!');
      console.log('Sleeping! Waiting for dawn...');
      // Sleep loop until morning
      const sleepStart = Date.now();
      while (bot.isSleeping && Date.now() - sleepStart < 10000 && !checkCancelled()) {
        await sleep(500);
      }
      console.log('Woke up! Time:', bot.time.timeOfDay);
      break;
    } catch (err) {
      console.log('Sleep notice:', err.message);
      if (err.message.includes('not possible right now')) {
        await sleep(1000);
      } else {
        await sleep(2000);
      }
    }
  } else if (!isNight && t > 23460) {
    // Past dawn
    break;
  } else if (!isNight && t < 12542) {
    const waitSeconds = Math.round((12542 - t) / 20);
    console.log(`Waiting for nightfall (${waitSeconds}s left)...`);
    if (waitSeconds > 15) {
      await sleep(5000);
    } else {
      await sleep(1000);
    }
  } else {
    break;
  }
}

// Check Base Chest contents
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log('=== Base Chest Contents ===');
    for (const it of items) {
      console.log(`  ${it.name} x${it.count}`);
    }
    chest.close();
  } catch (e) {
    console.log('Chest inspect error:', e.message);
  }
}

// Check nearby players
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log('Players in base:');
for (const p of players) {
  console.log(`- ${p.username} at ${lib.fmt(p.position)} (dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m)`);
}

bot.chat(`delta: United at Overworld base! HP: ${bot.health}/20, Food: ${bot.food}/20. Ready for Milestone 10!`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay,
  inv: lib.inv()
};
