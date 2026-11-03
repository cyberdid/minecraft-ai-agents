// team/autoload.js - shared helpers and constants
globalThis.baseSite = { x: 292, y: 72, z: -58 };

const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// Protect portals, spawners, base chests, and beds from accidental Haste III digging
globalThis.isProtectedBlock = function(b) {
  if (!b || !b.position) return false;
  const name = b.name || '';
  if (name === 'nether_portal' || name === 'end_portal_frame' || name === 'end_portal' || name === 'spawner') return true;
  const { x, y, z } = b.position;
  // Overworld Portal frame (298..301, 72..76, -55..-53)
  if (x >= 298 && x <= 301 && y >= 72 && y <= 76 && z >= -55 && z <= -53 && name === 'obsidian') return true;
  // Nether Portal frame around (39..43, 64..70, -9..-5)
  if (x >= 38 && x <= 44 && y >= 63 && y <= 70 && z >= -10 && z <= -4 && name === 'obsidian') return true;
  // Base chests, beds, crafting table, furnace inside base (291..297, 71..76, -59..-53)
  if (x >= 291 && x <= 297 && y >= 71 && y <= 76 && z >= -59 && z <= -53) {
    if (name.includes('chest') || name.includes('bed') || name === 'crafting_table' || name === 'furnace') return true;
  }
  return false;
};

globalThis.installBlockProtection = function() {
  if (bot && !bot._rawDigProtected) {
    const origBotDig = bot.dig.bind(bot);
    bot.dig = async function(block, ...rest) {
      if (globalThis.isProtectedBlock(block)) {
        return;
      }
      return origBotDig(block, ...rest);
    };
    bot._rawDigProtected = true;
  }
  if (typeof lib !== 'undefined' && lib && !lib._rawDigProtected && typeof lib.dig === 'function') {
    const origLibDig = lib.dig.bind(lib);
    lib.dig = async function(x, y, z, ...rest) {
      const b = (typeof x === 'object' && x !== null && x.position) ? x : bot.blockAt(new Vec3(x, y, z));
      if (globalThis.isProtectedBlock(b)) {
        return;
      }
      return origLibDig(x, y, z, ...rest);
    };
    lib._rawDigProtected = true;
  }
};
try { globalThis.installBlockProtection(); } catch (e) {}

globalThis.getBaseHouse = () => {
  return lib.shapes.house({
    x: 292,
    y: 72,
    z: -58,
    width: 5,
    depth: 5,
    height: 3,
    wall: 'cobblestone',
    roof: 'oak_planks',
    door: 'south',
    windows: false
  });
};

// Safe helper for making obsidian underground (handles cave_air properly unlike lib.makeObsidian)
globalThis.makeObsidianSafe = async function(n = 10) {
  if (!lib.count('diamond_pickaxe')) throw new Error('obsidian can only be mined with a diamond_pickaxe');
  const isAir = (b) => b && (b.name === 'air' || b.name === 'cave_air');
  const log = [];
  for (let round = 0; round < 8 && lib.count('obsidian') < n; round++) {
    if (!lib.count('water_bucket')) {
      if (!lib.count('bucket')) throw new Error('need a bucket to carry water');
      log.push(await lib.fillBucket('water'));
    }
    const pools = bot.findBlocks({ matching: (bl) => bl && bl.name === 'lava' && bl.metadata === 0, maxDistance: 48, count: 64 })
      .map((p) => bot.blockAt(p)).filter(Boolean)
      .sort((x, y) => x.position.distanceTo(bot.entity.position) - y.position.distanceTo(bot.entity.position));
    let edge = null;
    for (const lava of pools) {
      const up = bot.blockAt(lava.position.offset(0, 1, 0));
      if (!isAir(up)) continue;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nb = bot.blockAt(lava.position.offset(dx, 0, dz));
        const nbUp = bot.blockAt(lava.position.offset(dx, 1, dz));
        if (nb && nb.boundingBox === 'block' && isAir(nbUp)) { edge = nb; break; }
      }
      if (edge) break;
    }
    if (!edge) throw new Error(`no lava pool with a solid edge within 48 blocks (found ${pools.length} lava blocks)`);
    const e = edge.position;
    await bot.pathfinder.goto(new goals.GoalNear(e.x, e.y + 1, e.z, 3));
    await bot.equip(mcData.itemsByName.water_bucket.id, 'hand');
    await bot.lookAt(e.offset(0.5, 1, 0.5), true);
    bot.activateItem();
    await sleep(3000);
    const water = bot.blockAt(e.offset(0, 1, 0));
    if (water && water.name === 'water') {
      await bot.equip(mcData.itemsByName.bucket.id, 'hand');
      await bot.lookAt(e.offset(0.5, 1.5, 0.5), true);
      bot.activateItem();
      await sleep(600);
    }
    const obs = bot.findBlocks({ matching: (bl) => bl && bl.name === 'obsidian', maxDistance: 16, count: 20 });
    log.push(`round ${round + 1}: water poured at ${lib.fmt(e.offset(0, 1, 0))}, ${obs.length} obsidian formed`);
    for (const p of obs) {
      if (lib.count('obsidian') >= n) break;
      if (checkCancelled()) break;
      try {
        await lib.dig(p.x, p.y, p.z);
        await lib.pickup(4);
      } catch (err) {
        if (/cancelled/.test(err.message)) throw err;
      }
    }
  }
  if (lib.count('obsidian') < n) throw new Error(`made only ${lib.count('obsidian')}/${n} obsidian: ${log.join('; ')}`);
  return { obsidian: lib.count('obsidian'), log };
};

// Configure pathfinder movements to strictly treat fire, soul_fire, and lava as impassable obstacles
globalThis.configureFireAvoidance = function () {
  if (!bot.pathfinder || !mcData) return;
  const moves = new Movements(bot, mcData);
  if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
  if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
  if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
  moves.canDig = false;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);
};

// Punch out fire and soul_fire blocks ahead within 4.5m
globalThis.clearFireAhead = async function () {
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 4.5,
    count: 5
  });
  for (const fp of fires) {
    try {
      const b = bot.blockAt(fp);
      if (b) await bot.dig(b, true);
    } catch (e) {}
  }
};

// 19 safe waypoints avoiding fire field, lethal cliff drops, and spawner line of sight
globalThis.NETHER_PILLBOX_WAYPOINTS = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 66, z: -35 },
  { x: 62, y: 67, z: -50 },
  { x: 61.5, y: 67, z: -55 },
  { x: 61.5, y: 67, z: -60 },
  { x: 61.5, y: 67, z: -65 },
  { x: 61.5, y: 67, z: -70 },
  { x: 61.5, y: 67, z: -75 },
  { x: 62.0, y: 67, z: -80 },
  { x: 61, y: 66, z: -100 },
  { x: 50, y: 65, z: -115 },
  { x: 44, y: 65, z: -127 }, // Bunker
  { x: 44, y: 65, z: -145 }, // Covered tunnel
  { x: 44, y: 65, z: -160 },
  { x: 44, y: 65, z: -169 }, // Blast wall
  { x: 38, y: 65, z: -176 }, // Cross bridge
  { x: 36.5, y: 66, z: -187 } // Pillbox
];

// 1-line helper: Quickly ensure player has a sword, pickaxe, cobblestone, and armor/shield equipped
globalThis.quickRegear = async function({ cobble = 16 } = {}) {
  try { await lib.equipArmor(); } catch (e) {}
  if (lib.count('*_pickaxe') === 0) {
    try { await lib.obtain('stone_pickaxe', 1); } catch (e) {}
  }
  if (lib.count('*_sword') === 0) {
    try { await lib.obtain('stone_sword', 1); } catch (e) {}
  }
  if (lib.count('cobblestone') < cobble && bot.game.dimension === 'overworld') {
    try { await lib.collect('cobblestone', cobble - lib.count('cobblestone')); } catch (e) {}
  }
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
  return { hp: bot.health, food: bot.food, inv: lib.inv() };
};

// 1-line helper: Enter the Overworld Nether Portal at (299.5, 73.0, -54.0) and wait until in the_nether
globalThis.enterNetherPortal = async function(timeoutMs = 25000) {
  if (bot.game.dimension === 'the_nether') return { dimension: 'the_nether', pos: bot.entity.position };
  
  if (bot.entity.position.z < -54.2) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  }

  const moves = new Movements(bot, mcData);
  moves.canDig = false;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);

  try {
    await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -54.0, 0.8));
  } catch (e) {
    try { await lib.goToXZ(299.5, -54.0, { timeoutMs: 8000 }); } catch (e2) {}
  }
  
  const target = new Vec3(299.5, 73.0, -54.0);
  if (bot.entity.position.distanceTo(target) > 0.8) {
    await bot.lookAt(target, true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
    await sleep(800);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }
  
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  const start = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - start < timeoutMs && !checkCancelled()) {
    const cur = bot.entity.position;
    if (Math.abs(cur.x - 299.5) > 0.6 || Math.abs(cur.z - (-54.0)) > 0.6 || cur.y < 72.8) {
      await bot.lookAt(target, true);
      bot.setControlState('forward', true);
      if (cur.y < 72.8) bot.setControlState('jump', true);
      await sleep(300);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(250);
  }
  bot.clearControlStates();
  if (bot.game.dimension === 'the_nether') {
    await sleep(400);
    // Step forward out of portal into bunker
    if (bot.entity.position.distanceTo(new Vec3(40, 65, -7)) < 5.0) {
      await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
      bot.setControlState('forward', true);
      await sleep(1000);
      bot.setControlState('forward', false);
    }
  }
  return { dimension: bot.game.dimension, pos: bot.entity.position };
};

// 1-line helper: Transit from Overworld or Nether Base Camp all the way to the Blaze Spawner Pillbox (36.5, 66, -187)
globalThis.marchToSpawnerPillbox = async function() {
  if (bot.game.dimension === 'overworld') {
    await globalThis.enterNetherPortal();
  }
  if (bot.game.dimension !== 'the_nether') {
    throw new Error('Not in the_nether after enterNetherPortal');
  }
  globalThis.configureFireAvoidance();
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  let startIdx = 0;
  for (let i = 0; i < globalThis.NETHER_PILLBOX_WAYPOINTS.length; i++) {
    const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
    if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 3.5) {
      startIdx = i + 1;
    }
  }

  console.log(`Marching to Pillbox from WP ${startIdx}/${globalThis.NETHER_PILLBOX_WAYPOINTS.length}...`);

  for (let i = startIdx; i < globalThis.NETHER_PILLBOX_WAYPOINTS.length && !checkCancelled(); i++) {
    if (bot.game.dimension !== 'the_nether') break;

    await globalThis.clearFireAhead();

    const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
    const target = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(target) < 2.0) continue;

    // Past z=-165: sneak + raise shield facing ahead
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
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    } catch (e) {
      try {
        await globalThis.clearFireAhead();
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
      } catch (e2) {}
    }

    await globalThis.clearFireAhead();
    try { await lib.pickup(3.0); } catch (e) {}

    if (bot.health <= 7) {
      console.log(`Health low (${bot.health}) during march at WP ${i + 1}, holding in cover.`);
      break;
    }
  }

  bot.setControlState('sneak', false);
  return { dimension: bot.game.dimension, pos: bot.entity.position, hp: bot.health, rods: lib.count('blaze_rod') };
};

// 1-line helper: Fight Blazes safely from behind the Pillbox firing slit at (36, 66, -184..-187) and harvest Blaze Rods
globalThis.farmBlazeRodsAtPillbox = async function(targetRods = 8, durationMs = 120000) {
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  // Settle into pillbox position
  try {
    await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -187.0, 0.5));
  } catch (e) {}

  const start = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let hits = 0;
  let killed = 0;

  console.log(`Farming Blazes at Pillbox with Active Shield! Initial rods: ${lastRods}/${targetRods}, HP: ${bot.health}`);
  bot.activateItem(true); // Raise shield by default

  while (Date.now() - start < durationMs && bot.game.dimension === 'the_nether' && !checkCancelled()) {
    if (bot.health <= 6) {
      console.log(`HP low (${bot.health}), maintaining shield defense...`);
      bot.activateItem(true);
      await sleep(1000);
      continue;
    }

    // Keep position locked inside pillbox
    if (bot.entity.position.distanceTo(new Vec3(36.5, 66.0, -187.0)) > 1.2) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -187.0, 0.4));
      } catch (e) {}
    }

    const blazes = Object.values(bot.entities)
      .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
      .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

    const target = blazes[0];
    if (target) {
      const dist = bot.entity.position.distanceTo(target.position);
      // Face target to block fireballs with shield
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);

      // Strike if in melee range (<= 4.5m)
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
        bot.activateItem(true); // Shield raised
      }
    } else {
      // Face spawner at (32, 68, -190) with shield raised
      await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
      bot.activateItem(true);
    }

    // Safe vacuum inside pillbox
    const safeItems = Object.values(bot.entities).filter(e =>
      e.name === 'item' &&
      bot.entity.position.distanceTo(e.position) <= 2.5 &&
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

// 1-line helper: Retreat from Nether Pillbox back through the portal to the Overworld base
globalThis.retreatToOverworldBase = async function() {
  if (bot.game.dimension === 'the_nether') {
    globalThis.configureFireAvoidance();
    const rev = [...globalThis.NETHER_PILLBOX_WAYPOINTS].reverse();
    for (const wp of rev) {
      if (checkCancelled()) break;
      const v = new Vec3(wp.x, wp.y, wp.z);
      if (bot.entity.position.distanceTo(v) < 2.5) continue;
      try { await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 8000 }); } catch (e) {}
    }
    const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
    if (portalBlock) {
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
    try { await lib.goTo(293, 72, -55, 2, { timeoutMs: 12000 }); } catch (e) {}
  }
  return { dimension: bot.game.dimension, pos: bot.entity.position, hp: bot.health, rods: lib.count('blaze_rod') };
};
