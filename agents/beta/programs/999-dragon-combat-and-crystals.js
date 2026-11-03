console.log('=== Program 999: Ender Dragon Combat & Bedrock Podium Strike ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Equip Netherite Sword
const nSword = bot.inventory.items().find(i => i.name === 'netherite_sword');
if (nSword) {
  await bot.equip(nSword, 'hand');
  console.log('Equipped Netherite Sword in main hand!');
}

// Equip Shield in off-hand
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield) {
  try {
    await bot.equip(shield, 'off-hand');
    console.log('Equipped Shield in off-hand!');
  } catch (e) {}
}

bot.chat('Beta: Engaging Ender Dragon at center island with Netherite Sword and Shield!');

// Move towards bedrock podium at (0, 65, 0)
const podium = new Vec3(0, 65, 0);
console.log(`Advancing towards central bedrock podium at ${lib.fmt(podium)}...`);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

try {
  await bot.pathfinder.goto(new goals.GoalNear(podium.x, podium.y, podium.z, 6.0));
} catch (e) {
  console.log('Podium approach info:', e.message);
}

console.log(`Current combat position: ${lib.fmt(bot.entity.position)}`);

const start = Date.now();
const MAX_COMBAT_TIME = 35000; // 35s
let hits = 0;

while (Date.now() - start < MAX_COMBAT_TIME && !isCancelled()) {
  // 1. Locate Ender Dragon
  const dragon = Object.values(bot.entities).find(e => e.name === 'ender_dragon' && e.isValid);

  if (dragon) {
    const dist = bot.entity.position.distanceTo(dragon.position);

    // If dragon is within melee range (<= 7m), STRIKE!
    if (dist <= 7.0) {
      console.log(`DRAGON IN MELEE RANGE! Dist: ${dist.toFixed(1)}m. STRIKING!`);
      if (nSword) try { await bot.equip(nSword, 'hand'); } catch (e) {}
      await bot.lookAt(dragon.position.offset(0, 1.2, 0), true);

      // Jump critical strike
      bot.setControlState('jump', true);
      await sleep(100);
      bot.attack(dragon);
      bot.setControlState('jump', false);
      hits++;
      console.log(`Hit dragon! Total hits: ${hits}`);
      bot.chat(`Beta: Striking Ender Dragon! (${hits} hits landed)`);

      // Immediately raise shield
      if (shield) bot.activateItem(true);
      await sleep(400);
    } else if (dist <= 25.0) {
      // Dragon approaching: face it with shield raised
      await bot.lookAt(dragon.position.offset(0, 1.5, 0), true);
      if (shield) bot.activateItem(true);
    } else {
      if (shield) bot.deactivateItem();
    }
  }

  // 2. Locate any low or reachable End Crystals
  const crystals = Object.values(bot.entities).filter(e => e.name === 'end_crystal' && e.isValid);
  for (const c of crystals) {
    const cDist = bot.entity.position.distanceTo(c.position);
    if (cDist <= 5.0) {
      console.log(`Detonating nearby End Crystal at ${lib.fmt(c.position)}!`);
      await bot.lookAt(c.position, true);
      bot.attack(c);
      await sleep(300);
    } else if (cDist <= 30.0 && lib.count('arrow') > 0) {
      const bow = bot.inventory.items().find(i => i.name === 'bow' || i.name === 'crossbow');
      if (bow) {
        console.log(`Shooting End Crystal at ${lib.fmt(c.position)} (dist: ${cDist.toFixed(1)}m)...`);
        await bot.equip(bow, 'hand');
        await bot.lookAt(c.position.offset(0, 0.5, 0), true);
        bot.activateItem();
        await sleep(bow.name === 'crossbow' ? 1300 : 1100);
        bot.deactivateItem();
        if (bow.name === 'crossbow') {
          bot.activateItem();
          await sleep(200);
          bot.deactivateItem();
        }
        await sleep(500);
        if (nSword) await bot.equip(nSword, 'hand');
      }
    }
  }

  // Keep gaze low if no dragon nearby to prevent Enderman aggro
  if (!dragon || bot.entity.position.distanceTo(dragon.position) > 25.0) {
    await bot.look(bot.entity.yaw, -0.2, true);
  }

  await sleep(250);
}

if (shield) bot.deactivateItem();

return {
  pos: bot.entity.position,
  hits,
  hp: bot.health,
  food: bot.food
};
