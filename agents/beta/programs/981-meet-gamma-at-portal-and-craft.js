console.log('=== Program 981: Meet Gamma at Portal & Craft All Eyes ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Time:', bot.time.timeOfDay);
console.log('Holding:', lib.count('ender_eye'), 'ender_eye,', lib.count('ender_pearl'), 'ender_pearl');

// Step outside the base house through door
console.log('Going through base house door at (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door exit error:', e.message);
}

// Stand at safe portal observation point (297.0, 72.0, -54.0)
const obsPos = new Vec3(297.0, 72.0, -54.0);
console.log(`Moving to observation point ${lib.fmt(obsPos)}...`);
try {
  await bot.pathfinder.goto(new goals.GoalNear(obsPos.x, obsPos.y, obsPos.z, 0.5));
} catch (e) {
  console.log('Path to observation point error:', e.message);
}

// Check for Gamma
const checkStart = Date.now();
const MAX_WAIT = 25000;

while (Date.now() - checkStart < MAX_WAIT && !isCancelled()) {
  try { await lib.pickup(5.0); } catch (e) {}

  const g = bot.players['gamma'];
  if (g && g.entity) {
    console.log(`Gamma spotted at ${lib.fmt(g.entity.position)}! Held: ${g.entity.heldItem?.name}`);
  }

  const a = bot.players['alpha'];
  if (a && a.entity) {
    console.log(`Alpha spotted at ${lib.fmt(a.entity.position)}! Held: ${a.entity.heldItem?.name}`);
  }

  const d = bot.players['delta'];
  if (d && d.entity) {
    console.log(`Delta spotted at ${lib.fmt(d.entity.position)}! Held: ${d.entity.heldItem?.name}`);
  }

  // If we picked up blaze powder or blaze rod:
  if (lib.count('blaze_rod') > 0) {
    try {
      await lib.craft('blaze_powder', lib.count('blaze_rod') * 2);
    } catch (e) {}
  }

  if (lib.count('blaze_powder') > 0 && lib.count('ender_pearl') > 0) {
    const toCraft = Math.min(lib.count('blaze_powder'), lib.count('ender_pearl'));
    console.log(`Crafting ${toCraft} ender_eye...`);
    try {
      await lib.craft('ender_eye', toCraft);
      console.log(`SUCCESS: ${lib.count('ender_eye')} ender_eye held!`);
      bot.chat(`Beta: Crafted ${toCraft} Eyes of Ender! Total held: ${lib.count('ender_eye')}!`);
    } catch (e) {
      console.log('Craft error:', e.message);
    }
  }

  if (lib.count('ender_eye') >= 12) break;

  await sleep(1500);
}

// Return to base house
console.log('Returning to base house interior...');
try {
  await lib.goTo(294, 72, -53, 1.0, { timeoutMs: 5000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Return error:', e.message);
}

return {
  pos: bot.entity.position,
  eyes: lib.count('ender_eye'),
  pearls: lib.count('ender_pearl'),
  food: bot.food,
  hp: bot.health
};
