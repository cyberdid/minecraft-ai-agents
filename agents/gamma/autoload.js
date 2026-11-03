// /home/cyberdid/Projects/Minecraft/agents/gamma/autoload.js
// Gamma specialized robust helpers overriding and enhancing team autoload

const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

globalThis.NETHER_PILLBOX_WAYPOINTS = [
  { x: 46, y: 65, z: -7 },    // 0: Nether Portal Camp
  { x: 54, y: 65, z: -7 },    // 1
  { x: 63, y: 64, z: -7 },    // 2: East Ridge Entrance
  { x: 63, y: 65, z: -20 },   // 3
  { x: 63, y: 66, z: -35 },   // 4
  { x: 62, y: 67, z: -50 },   // 5
  { x: 61.5, y: 67, z: -60 }, // 6
  { x: 61.5, y: 67, z: -70 }, // 7
  { x: 62, y: 67, z: -80 },   // 8
  { x: 61, y: 66, z: -100 },  // 9: Ridge North Bend
  { x: 50, y: 65, z: -115 },  // 10: Fortress Approach
  { x: 44, y: 65, z: -127 },  // 11: Fortress Workshop Bunker
  { x: 44, y: 65, z: -145 },  // 12: Covered Tunnel
  { x: 44, y: 65, z: -160 },  // 13
  { x: 44, y: 65, z: -169 },  // 14: Blast Wall
  { x: 38, y: 65, z: -176 },  // 15: Cross Bridge
  { x: 36.5, y: 66, z: -187 } // 16: Spawner Pillbox
];

// Configure pathfinder movements to strictly avoid fire, soul_fire, and lava
globalThis.configureFireAvoidance = function () {
  if (!bot.pathfinder || !mcData) return;
  const moves = new Movements(bot, mcData);
  if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
  if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
  if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
  moves.canDig = false;
  moves.maxDropDown = 2; // Never drop off cliffs into Nether lava
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);
};

// Punch out fire and soul_fire blocks ahead within 4.5m
globalThis.clearFireAhead = async function () {
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 4.5,
    count: 6
  });
  for (const fp of fires) {
    try {
      const b = bot.blockAt(fp);
      if (b) await bot.dig(b, true);
    } catch (e) {}
  }
};

// 1-line helper: Ensure weapons, armor, golden_boots neutrality, and offhand shield
globalThis.quickRegear = async function({ cobble = 16 } = {}) {
  // 1. Maintain golden boots on feet (Piglin neutrality)
  const currentFeet = bot.inventory.slots[8]?.name;
  if (currentFeet !== 'golden_boots') {
    const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) {
      try { await bot.equip(gb, 'feet'); } catch (e) {}
    }
  }

  // 2. Equip other armor pieces (helmet, chestplate, leggings) without overwriting golden_boots
  for (const piece of ['iron_helmet', 'diamond_helmet']) {
    const item = bot.inventory.items().find(i => i.name === piece);
    if (item && !bot.inventory.slots[5]) {
      try { await bot.equip(item, 'head'); } catch (e) {}
    }
  }
  for (const piece of ['iron_chestplate', 'diamond_chestplate']) {
    const item = bot.inventory.items().find(i => i.name === piece);
    if (item && !bot.inventory.slots[6]) {
      try { await bot.equip(item, 'torso'); } catch (e) {}
    }
  }
  for (const piece of ['iron_leggings', 'diamond_leggings']) {
    const item = bot.inventory.items().find(i => i.name === piece);
    if (item && !bot.inventory.slots[7]) {
      try { await bot.equip(item, 'legs'); } catch (e) {}
    }
  }

  // 3. Offhand shield
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    try { await bot.equip(shield, 'off-hand'); } catch (e) {}
  }

  // 4. Weapon
  try { await lib.equipWeapon(); } catch (e) {}

  // 5. Pickaxe check
  if (lib.count('*_pickaxe') === 0) {
    try { await lib.obtain('stone_pickaxe', 1); } catch (e) {}
  }

  // 6. Overworld cobble collection
  if (lib.count('cobblestone') < cobble && bot.game.dimension === 'overworld') {
    try { await lib.collect('cobblestone', cobble - lib.count('cobblestone')); } catch (e) {}
  }

  return { hp: bot.health, food: bot.food, inv: lib.inv(), feet: bot.inventory.slots[8]?.name };
};

// 1-line helper: Walk to Nether Portal and warp
globalThis.enterNetherPortal = async function(timeoutMs = 25000) {
  if (bot.game.dimension === 'the_nether') return { dimension: 'the_nether', pos: bot.entity.position };

  // Exit base door if inside base (z < -53.5)
  const curPos = bot.entity.position;
  if (curPos.x < 297 && curPos.z < -53.5) {
    try {
      console.log('Exiting base door at (294, 72, -54)...');
      await lib.goThroughDoor(294, 72, -54);
    } catch (e) {
      try {
        await lib.door(294, 72, -54, true);
        await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -53));
        await lib.door(294, 72, -54, false);
      } catch (e2) {}
    }
  }

  // Configure movement
  const moves = new Movements(bot, mcData);
  moves.canDig = false;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);

  try {
    await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -53.5, 1.2));
  } catch (e) {
    try { await lib.goTo(299, 72, -52, 1.5, { timeoutMs: 8000 }); } catch (e2) {}
  }

  const target = new Vec3(299.5, 73.0, -53.5);
  await bot.lookAt(target, true);
  bot.setControlState('forward', true);
  if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
  await sleep(800);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);

  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  const start = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - start < timeoutMs && !checkCancelled()) {
    const cur = bot.entity.position;
    if (Math.abs(cur.x - 299.5) > 0.4 || Math.abs(cur.z - (-53.5)) > 0.4 || cur.y < 72.8) {
      await bot.lookAt(target, true);
      bot.setControlState('forward', true);
      if (cur.y < 72.8) bot.setControlState('jump', true);
      await sleep(200);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(250);
  }

  if (bot.game.dimension === 'the_nether') {
    await sleep(400);
    // Step forward into bunker
    if (bot.entity.position.distanceTo(new Vec3(46, 65, -7)) < 6.0) {
      await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
      bot.setControlState('forward', true);
      await sleep(1000);
      bot.setControlState('forward', false);
    }
  }
  return { dimension: bot.game.dimension, pos: bot.entity.position };
};

// 1-line helper: March from current location along safe waypoints to Spawner Pillbox (36.5, 66, -187)
globalThis.marchToSpawnerPillbox = async function() {
  if (bot.game.dimension === 'overworld') {
    await globalThis.enterNetherPortal();
  }
  if (bot.game.dimension !== 'the_nether') {
    throw new Error('Not in the_nether after enterNetherPortal');
  }
  globalThis.configureFireAvoidance();
  await globalThis.quickRegear();

  // Find the closest waypoint to start from
  let closestDist = Infinity;
  let startIdx = 0;
  for (let i = 0; i < globalThis.NETHER_PILLBOX_WAYPOINTS.length; i++) {
    const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
    const d = bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z));
    if (d < closestDist) {
      closestDist = d;
      startIdx = i;
    }
  }
  if (closestDist < 2.0 && startIdx < globalThis.NETHER_PILLBOX_WAYPOINTS.length - 1) {
    startIdx++;
  }

  console.log(`Marching to Pillbox starting from WP ${startIdx}/${globalThis.NETHER_PILLBOX_WAYPOINTS.length}...`);

  for (let i = startIdx; i < globalThis.NETHER_PILLBOX_WAYPOINTS.length && !checkCancelled(); i++) {
    if (bot.game.dimension !== 'the_nether') break;

    await globalThis.clearFireAhead();

    const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
    const target = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(target) < 2.0) continue;

    // Past z=-165: sneak + shield
    if (wp.z <= -165) {
      bot.setControlState('sneak', true);
      bot.activateItem(true);
    } else {
      bot.setControlState('sneak', false);
      bot.deactivateItem();
    }

    // Keep gaze low to avoid Enderman aggro
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

    try {
      await lib.goTo(wp.x, wp.y, wp.z, 1.8, { dig: false, timeoutMs: 12000 });
    } catch (e) {
      try {
        await globalThis.clearFireAhead();
        await bot.lookAt(new Vec3(wp.x + 0.5, wp.y + 0.8, wp.z + 0.5), true);
        bot.setControlState('forward', true);
        await sleep(600);
        bot.setControlState('forward', false);
      } catch (e2) {}
    }

    await globalThis.clearFireAhead();
    try { await lib.pickup(3.5); } catch (e) {}

    if (bot.entity.position.y < 60) {
      console.log(`Critical: y < 60, aborting march.`);
      break;
    }

    if (bot.health <= 4) {
      console.log(`Health critical (${bot.health}), holding in cover.`);
      break;
    }
  }

  bot.setControlState('sneak', false);
  return { dimension: bot.game.dimension, pos: bot.entity.position, hp: bot.health, rods: lib.count('blaze_rod') };
};

// 1-line helper: Farm Blazes safely behind the Pillbox firing slit at (36.5, 66, -187)
globalThis.farmBlazeRodsAtPillbox = async function(targetRods = 8, durationMs = 90000) {
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();
  await globalThis.quickRegear();

  const pillboxTarget = new Vec3(36.5, 66.0, -187.0);
  try {
    await lib.goTo(pillboxTarget.x, pillboxTarget.y, pillboxTarget.z, 0.8, { dig: false, timeoutMs: 6000 });
  } catch (e) {}

  const start = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let hits = 0;
  let killed = 0;

  console.log(`Farming Blazes at Pillbox! Initial rods: ${lastRods}/${targetRods}, HP: ${bot.health}`);
  bot.activateItem(true); // Raise shield by default

  while (Date.now() - start < durationMs && bot.game.dimension === 'the_nether' && !checkCancelled()) {
    if (bot.health <= 4) {
      bot.activateItem(true);
      await sleep(1000);
      continue;
    }

    // Keep position locked inside pillbox
    if (bot.entity.position.distanceTo(pillboxTarget) > 1.2) {
      try {
        await lib.goTo(pillboxTarget.x, pillboxTarget.y, pillboxTarget.z, 0.5, { dig: false, timeoutMs: 3000 });
      } catch (e) {}
    }

    const blazes = Object.values(bot.entities)
      .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
      .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

    const target = blazes[0];
    if (target) {
      const dist = bot.entity.position.distanceTo(target.position);
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);

      if (dist <= 4.5 && Date.now() - lastAttack > 650) {
        bot.deactivateItem(); // Lower shield
        try { await lib.equipWeapon(); } catch (e) {}
        bot.attack(target);
        lastAttack = Date.now();
        hits++;
        bot.activateItem(true); // Re-raise shield immediately!
        if (target.health !== undefined && target.health <= 0) {
          killed++;
          console.log(`Blaze slain! Kills: ${killed}`);
        }
      } else {
        bot.activateItem(true);
      }
    } else {
      await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
      bot.activateItem(true);
    }

    // Safe vacuum inside pillbox
    const safeItems = Object.values(bot.entities).filter(e =>
      e.name === 'item' &&
      bot.entity.position.distanceTo(e.position) <= 2.8 &&
      e.position.x >= 35.5 &&
      e.position.z <= -185.0
    );
    for (const item of safeItems) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(item.position.x, item.position.y, item.position.z, 0.4));
      } catch (e) {}
    }

    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      bot.chat(`${bot.username}: Harvested Blaze Rod! Total: ${curRods}/${targetRods}`);
      console.log(`Harvested Blaze Rod! Total: ${curRods}/${targetRods}`);
      lastRods = curRods;
    }

    if (curRods >= targetRods) {
      bot.chat(`${bot.username}: Milestone 8 COMPLETED! ${curRods} Blaze Rods secured!`);
      break;
    }

    await sleep(100);
  }

  bot.deactivateItem();
  const finalRods = lib.count('blaze_rod');
  console.log(`Pillbox combat end. Rods: ${finalRods}/${targetRods}, Hits: ${hits}, Kills: ${killed}, HP: ${bot.health}`);
  return { killed, rods: finalRods, hp: bot.health, pos: bot.entity.position };
};

// 1-line helper: Retreat from current Nether position back through the portal to Overworld base
globalThis.retreatToOverworldBase = async function() {
  if (bot.game.dimension === 'the_nether') {
    globalThis.configureFireAvoidance();

    // Find closest waypoint index
    let closestDist = Infinity;
    let startIdx = 0;
    for (let i = 0; i < globalThis.NETHER_PILLBOX_WAYPOINTS.length; i++) {
      const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
      const d = bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z));
      if (d < closestDist) {
        closestDist = d;
        startIdx = i;
      }
    }

    console.log(`Retreating to portal starting from WP ${startIdx} -> WP 0...`);
    for (let i = startIdx; i >= 0 && !checkCancelled(); i--) {
      const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
      const v = new Vec3(wp.x, wp.y, wp.z);
      if (bot.entity.position.distanceTo(v) < 2.2) continue;
      await globalThis.clearFireAhead();
      await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
      try {
        await lib.goTo(wp.x, wp.y, wp.z, 2.0, { dig: false, timeoutMs: 10000 });
      } catch (e) {}
      await globalThis.clearFireAhead();
    }

    // Step into portal at (46.5, 66.0, 2.0) or find nearest nether_portal block
    const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
    if (portalBlock) {
      console.log(`Entering portal at ${lib.fmt(portalBlock.position)}...`);
      await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
      bot.setControlState('forward', true);
      await sleep(1500);
      bot.setControlState('forward', false);

      const warpStart = Date.now();
      while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !checkCancelled()) {
        await sleep(300);
      }
    }
  }

  if (bot.game.dimension === 'overworld') {
    console.log('Arrived in Overworld! Heading to base at (293, 72, -55)...');
    try {
      await lib.goTo(293, 72, -55, 1.8, { timeoutMs: 12000 });
    } catch (e) {}
  }

  return { dimension: bot.game.dimension, pos: bot.entity.position, hp: bot.health, rods: lib.count('blaze_rod') };
};
