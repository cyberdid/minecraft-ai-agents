// alpha/autoload.js
// Custom reliable door helper for base door at (294, 72, -54)

globalThis.safeEat = async function(foodName) {
  const item = bot.inventory.items().find(i => i.name === foodName);
  if (!item) return false;
  await bot.equip(item, 'hand');
  bot.deactivateItem();
  bot.activateItem();
  const startFood = bot.food;
  const startCount = bot.inventory.count(item.type);
  for (let i = 0; i < 40; i++) {
    await sleep(100);
    if (bot.food > startFood || bot.inventory.count(item.type) < startCount) {
      bot.deactivateItem();
      return true;
    }
  }
  bot.deactivateItem();
  return false;
};

globalThis.passDoorOut = async function() {
  await lib.door(294, 72, -54, true);
  await sleep(200);
  await lib.walkTo(294.5, -52);
  await lib.door(294, 72, -54, false);
};

globalThis.passDoorIn = async function() {
  await lib.door(294, 72, -54, true);
  await sleep(200);
  await lib.walkTo(294.5, -56);
  await lib.door(294, 72, -54, false);
};

// Refined safe waypoints to Spawner Pillbox with zero cliff cutoffs
globalThis.SAFE_NETHER_WAYPOINTS = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 66, z: -35 },
  { x: 62, y: 67, z: -50 },
  { x: 61, y: 67, z: -65 },
  { x: 62, y: 67, z: -80 },
  { x: 61, y: 66, z: -100 },
  { x: 50, y: 65, z: -115 },
  { x: 44, y: 65, z: -127 }, // Fortress Workshop Bunker
  { x: 44, y: 65, z: -145 }, // Covered Tunnel
  { x: 44, y: 65, z: -160 },
  { x: 44, y: 65, z: -169 }, // Blast Wall
  { x: 38, y: 65, z: -176 }, // Cross Bridge start
  { x: 37, y: 65, z: -178 }, // Shift west safely
  { x: 37, y: 66, z: -182 }, // Covered walkway
  { x: 36, y: 66, z: -185 }, // Pillbox entrance
  { x: 36, y: 66, z: -187 }  // Spawner Pillbox Firing Slit
];

// March helper with sneak on bridges to prevent collision/knockback falls into lava
globalThis.safeMarchToPillbox = async function() {
  if (bot.game.dimension === 'overworld') {
    await globalThis.enterNetherPortal();
  }
  if (bot.game.dimension !== 'the_nether') {
    throw new Error('Not in the_nether after enterNetherPortal');
  }
  globalThis.configureFireAvoidance();
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  const isCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);
  for (let i = 0; i < globalThis.SAFE_NETHER_WAYPOINTS.length && !isCancelled(); i++) {
    const wp = globalThis.SAFE_NETHER_WAYPOINTS[i];
    const v = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(v) < 1.5) continue;
    
    // Enable sneak on the exposed bridge past z=-170 to make falling impossible
    if (wp.z <= -170) {
      bot.setControlState('sneak', true);
    } else {
      bot.setControlState('sneak', false);
    }

    try {
      await lib.goTo(wp.x, wp.y, wp.z, 1.0, { dig: false, timeoutMs: 12000 });
    } catch (e) {
      try {
        await bot.lookAt(v.offset(0.5, 0.5, 0.5), true);
        bot.setControlState('forward', true);
        await sleep(800);
        bot.setControlState('forward', false);
      } catch (e2) {}
    }
    try { await lib.pickup(3.0); } catch (e) {}
    if (bot.health <= 7) {
      console.log(`Health low (${bot.health}) during march at WP ${i + 1}, stopping in cover.`);
      break;
    }
  }
  bot.setControlState('sneak', false);
  return { dimension: bot.game.dimension, pos: bot.entity.position, hp: bot.health, rods: lib.count('blaze_rod') };
};
