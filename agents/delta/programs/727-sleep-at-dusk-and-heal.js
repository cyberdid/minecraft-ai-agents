// programs/727-sleep-at-dusk-and-heal.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 727: WAIT FOR DUSK, SLEEP & FULL HEAL ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food, 'Time:', bot.time.timeOfDay);

// Chat to gamma about the open portal
bot.chat('gamma: Portal 2 at (41, 65, -7) is blocked by obsidian at x=42! Portal 1 at (46.5, 66.0, 2.0) is 100% open!');

const start = Date.now();
const MAX_WAIT_MS = 90000;

// Wait for dusk (timeOfDay >= 12542 && timeOfDay <= 23460)
while (!isCancelled() && Date.now() - start < MAX_WAIT_MS) {
  const tod = bot.time.timeOfDay;
  
  // Also check if any teammates are near
  const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== 'delta');
  for (const p of players) {
    if (bot.entity.position.distanceTo(p.position) < 8.0) {
      // log periodically
      if (Math.floor((Date.now() - start) / 1000) % 5 === 0) {
        console.log(`Nearby player: ${p.username} at ${lib.fmt(p.position)}, held=${p.heldItem?.name}`);
      }
    }
  }

  // Check if it is time to sleep
  if (tod >= 12540 && tod <= 23460) {
    console.log(`Dusk reached (tod=${tod})! Finding bed inside Base House...`);
    const bed = bot.findBlock({
      matching: b => b && b.name.includes('bed'),
      maxDistance: 6
    });

    if (bed) {
      console.log(`Found bed at ${lib.fmt(bed.position)}. Sleeping...`);
      try {
        await bot.sleep(bed);
        console.log('Sleeping successfully! Waiting for morning...');
        while (bot.isSleeping && !isCancelled()) {
          await sleep(500);
        }
        console.log('Woke up! Current time:', bot.time.timeOfDay, 'HP:', bot.health, 'Food:', bot.food);
        break;
      } catch (e) {
        console.log('Sleep error:', e.message);
      }
    } else {
      console.log('No bed found within 6 blocks!');
    }
  }

  await sleep(1000);
}

// Post-sleep check
console.log('\n=== Post-Sleep Status ===');
console.log('HP:', bot.health, 'Food:', bot.food, 'Time:', bot.time.timeOfDay);
console.log('Delta Pos:', lib.fmt(bot.entity.position));

// Check Base Chest
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Base Chest items:');
    for (const it of items) {
      if (['blaze_powder', 'blaze_rod', 'ender_pearl', 'ender_eye', 'cooked_beef', 'cooked_porkchop', 'iron_ingot'].includes(it.name)) {
        console.log(`  * ${it.name} x${it.count}`);
      }
    }
    chest.close();
  } catch (e) {}
}

return {
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay,
  pos: bot.entity.position
};
