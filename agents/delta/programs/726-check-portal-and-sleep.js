// programs/726-check-portal-and-sleep.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 726: PORTAL RECEPTION & BED SLEEP ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food, 'Time:', bot.time.timeOfDay);

const start = Date.now();
const MAX_WAIT = 35000;

while (Date.now() - start < MAX_WAIT && !isCancelled()) {
  const tod = bot.time.timeOfDay;

  // Check all players in render
  const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== 'delta');
  for (const p of players) {
    console.log(`Player ${p.username}: pos=${lib.fmt(p.position)}, dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}m, held=${p.heldItem?.name}`);
  }

  // Vacuum drops
  try { await lib.pickup(4.0); } catch (e) {}

  // Check Base Chest
  const cb = bot.blockAt(new Vec3(293, 72, -57));
  if (cb) {
    try {
      const chest = await bot.openChest(cb);
      const items = chest.containerItems();
      const bp = items.find(i => i.name === 'blaze_powder');
      const br = items.find(i => i.name === 'blaze_rod');
      const ep = items.find(i => i.name === 'ender_pearl');
      const ee = items.find(i => i.name === 'ender_eye');
      if (bp || br || ep || ee) {
        console.log(`Base Chest has: bp=${bp?.count}, br=${br?.count}, ep=${ep?.count}, ee=${ee?.count}`);
      }
      chest.close();
    } catch (e) {}
  }

  // Sleep check: dusk starts at 12542
  if (tod >= 12542 && tod <= 23460) {
    console.log(`Dusk/Night active (tod=${tod})! Finding bed to sleep and heal...`);
    // Beds at (294, 72, -55) and (293, 72, -56)
    const beds = bot.findBlocks({
      matching: b => b && b.name.includes('bed'),
      maxDistance: 6,
      count: 2
    });
    for (const bPos of beds) {
      const bBlock = bot.blockAt(bPos);
      try {
        console.log(`Attempting sleep at bed ${lib.fmt(bPos)}...`);
        await bot.sleep(bBlock);
        console.log('Sleeping! Waiting for dawn...');
        while (bot.isSleeping && !isCancelled()) {
          await sleep(500);
        }
        console.log('Woke up! HP:', bot.health, 'Food:', bot.food);
        break;
      } catch (err) {
        console.log(`Bed sleep err at ${lib.fmt(bPos)}:`, err.message);
      }
    }
  }

  await sleep(1500);
}

return {
  deltaPos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay
};
