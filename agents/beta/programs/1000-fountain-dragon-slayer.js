console.log('=== Program 1000: Bedrock Fountain Dragon Slayer ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// Equip Netherite Sword in main hand
const nSword = bot.inventory.items().find(i => i.name === 'netherite_sword');
if (nSword) {
  await bot.equip(nSword, 'hand');
  console.log('Netherite Sword EQUIPPED!');
}

// Equip Shield in off-hand
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield) {
  try { await bot.equip(shield, 'off-hand'); } catch (e) {}
}

// Move directly onto the Bedrock Fountain rim at (3.5, 60.0, 2.5)
const fountainRim = new Vec3(3.5, 60.0, 2.5);
console.log(`Positioning at Bedrock Fountain rim: ${lib.fmt(fountainRim)}...`);

try {
  await bot.pathfinder.goto(new goals.GoalNear(fountainRim.x, fountainRim.y, fountainRim.z, 1.0));
} catch (e) {
  try {
    await bot.lookAt(fountainRim, true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.clearControlStates();
  } catch (e2) {}
}

console.log(`Combat station locked: ${lib.fmt(bot.entity.position)}`);
bot.chat('Beta: Stationed at Bedrock Fountain (3, 60, 2) with Netherite Sword! Striking Dragon on all perches!');

const start = Date.now();
const COMBAT_DURATION = 50000; // 50 seconds continuous battle
let hits = 0;
let lastHit = 0;

while (Date.now() - start < COMBAT_DURATION && !isCancelled()) {
  // Find Ender Dragon
  const dragon = Object.values(bot.entities).find(e => e.name === 'ender_dragon' && e.isValid);

  if (dragon) {
    const dist = bot.entity.position.distanceTo(dragon.position);

    // If Dragon is within striking distance (<= 9.0m)
    if (dist <= 9.0) {
      // Lower shield to strike
      if (shield) bot.deactivateItem();

      // Look at dragon center/head
      await bot.lookAt(dragon.position.offset(0, 1.8, 0), true);

      // Critical jump strike every 550ms
      if (Date.now() - lastHit > 550) {
        if (nSword) try { await bot.equip(nSword, 'hand'); } catch (e) {}

        bot.setControlState('jump', true);
        await sleep(80);
        bot.attack(dragon);
        bot.setControlState('jump', false);

        hits++;
        lastHit = Date.now();
        console.log(`CRITICAL STRIKE on Ender Dragon! Total hits: ${hits}, Dist: ${dist.toFixed(1)}m`);
        bot.chat(`Beta: CRITICAL STRIKE on Ender Dragon! (Hit #${hits})`);

        // Re-raise shield immediately
        if (shield) bot.activateItem(true);
      }
    } else if (dist <= 22.0) {
      // Dragon swooping in: face it with shield raised
      await bot.lookAt(dragon.position.offset(0, 1.5, 0), true);
      if (shield) bot.activateItem(true);
    } else {
      if (shield) bot.deactivateItem();
      // Keep gaze down to avoid Enderman aggro
      await bot.look(bot.entity.yaw, -0.2, true);
    }
  } else {
    // Keep gaze low
    await bot.look(bot.entity.yaw, -0.2, true);
  }

  // If health drops below 12, raise shield
  if (bot.health < 12 && shield) {
    bot.activateItem(true);
  }

  // Keep position pinned near fountain
  if (bot.entity.position.distanceTo(fountainRim) > 4.0) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(fountainRim.x, fountainRim.y, fountainRim.z, 1.2));
    } catch (e) {}
  }

  await sleep(150);
}

if (shield) bot.deactivateItem();
console.log(`Combat round complete. Hits landed: ${hits}, HP: ${bot.health}`);

return {
  hits,
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position
};
