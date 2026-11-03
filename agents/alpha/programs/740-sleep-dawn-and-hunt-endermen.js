// programs/740-sleep-dawn-and-hunt-endermen.js
console.log('=== Program 740: Sleep to Dawn & Soul Sand Valley Enderman Hunt ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain offhand shield and iron sword
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

try {
  const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
  if (sw) await bot.equip(sw, 'hand');
  else await lib.equipWeapon();
} catch (e) {}

// 2. Wait for night and sleep in base bed (294, 72, -55)
if (bot.game.dimension === 'overworld') {
  console.log(`Time: night in ${lib.time().nightIn}s, canSleep: ${lib.time().canSleep}`);
  bot.chat(`alpha: At Base Bed (294, 72, -55). Night in ${lib.time().nightIn}s! Ready to skip night to dawn!`);

  const waitStart = Date.now();
  while (!checkCancelled() && !lib.time().canSleep && Date.now() - waitStart < 95000) {
    if (lib.time().canSleep) break;
    await sleep(1000);
  }

  if (lib.time().canSleep) {
    console.log('Night reached! Sleeping in base bed...');
    try {
      await lib.sleepInBed();
      bot.chat('alpha: Slept in base bed! Advancing server cleanly to dawn!');
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
    // Wait briefly for morning
    while (!checkCancelled() && bot.isSleeping) {
      await sleep(1000);
    }
  }

  console.log(`Dawn reached! Time: ${bot.time.timeOfDay}, HP: ${bot.health}/20, Food: ${bot.food}/20`);
  bot.chat('alpha: Dawn at base! Entering Nether Portal for Soul Sand Valley Endermen hunt!');

  // 3. Enter Nether portal
  console.log('Entering Nether Portal at (299.5, 73.0, -54.0)...');
  const warpRes = await globalThis.enterNetherPortal();
  console.log('Portal warp result:', JSON.stringify(warpRes));
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Not in Nether: ${bot.game.dimension}`);
}

bot.chat(`alpha: In the_nether at ${lib.fmt(bot.entity.position)}! Marching Soul Sand Valley trail hunting Endermen for Milestone 9!`);
globalThis.configureFireAvoidance();

// 4. March Soul Sand Valley waypoints (WP 0 to WP 14) and hunt Endermen
let pearlsHarvested = 0;
let initialPearls = lib.count('ender_pearl');

for (let i = 0; i < 15 && !checkCancelled(); i++) {
  const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  await globalThis.clearFireAhead();

  // If Hoglin zone, sneak and shield
  if (wp.z <= -70 && wp.z >= -105) {
    bot.activateItem(true);
    bot.setControlState('sneak', true);
  } else {
    bot.deactivateItem();
    bot.setControlState('sneak', false);
  }

  // Check for Endermen within 30m of covered trail
  const endermen = Object.values(bot.entities).filter(e =>
    e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 30
  );

  if (endermen.length > 0) {
    const em = endermen[0];
    const dist = bot.entity.position.distanceTo(em.position).toFixed(1);
    console.log(`Enderman spotted at ${lib.fmt(em.position)} (${dist}m)! Provoking gaze from safe trail...`);
    bot.chat(`alpha: Provoking Enderman at ${lib.fmt(em.position)} from covered trail!`);

    // Stare at head (y + 2.7) to provoke
    await bot.lookAt(em.position.offset(0, 2.7, 0), true);
    await sleep(800);

    // Combat loop while Enderman attacks
    const emStart = Date.now();
    let emHit = 0;
    while (!checkCancelled() && em.isValid && Date.now() - emStart < 15000) {
      const d = bot.entity.position.distanceTo(em.position);
      await bot.lookAt(em.position.offset(0, 1.2, 0), true);

      if (d <= 3.8 && Date.now() - emHit > 625) {
        bot.deactivateItem();
        try { await lib.equipWeapon(); } catch (e) {}
        bot.attack(em);
        emHit = Date.now();
        bot.activateItem(true);
        console.log(`Hit Enderman! Distance: ${d.toFixed(1)}m`);
      } else {
        bot.activateItem(true);
      }
      await sleep(80);
    }
    bot.deactivateItem();
    await lib.pickup(5.0);

    const curPearls = lib.count('ender_pearl');
    if (curPearls > initialPearls) {
      pearlsHarvested += (curPearls - initialPearls);
      initialPearls = curPearls;
      console.log(`*** HARVESTED ENDER PEARL! Total: ${curPearls}/12 ***`);
      bot.chat(`alpha: Harvested Ender Pearl! Total: ${curPearls}/12 toward Milestone 9!`);
    }
  }

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await globalThis.clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
    } catch (e2) {}
  }

  await lib.pickup(3.0);
}

bot.clearControlStates();
bot.deactivateItem();

const finalPearls = lib.count('ender_pearl');
console.log(`Operations complete at ${lib.fmt(bot.entity.position)}. Total pearls: ${finalPearls}/12, HP: ${bot.health}`);
bot.chat(`alpha: Hunt & march completed at ${lib.fmt(bot.entity.position)}! Pearls: ${finalPearls}/12, HP: ${bot.health.toFixed(1)}/20`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  pearls: finalPearls,
  inv: lib.inv()
};
