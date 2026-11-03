// programs/520-deliver-gold-to-bunker.js
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('=== DELTA: DELIVER 2 GOLD INGOTS TO FORTRESS BUNKER ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, Gold held: ${lib.count('gold_ingot')}, HP: ${bot.health}`);

bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

// Safe fire extinguisher helper
const extinguishNearbyFire = async function (radius = 6) {
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: radius,
    count: 25
  });
  if (fires.length > 0) {
    console.log(`Extinguishing ${fires.length} fire blocks within ${radius}m...`);
    for (const fp of fires) {
      try {
        const b = bot.blockAt(fp);
        if (b && (b.name === 'fire' || b.name === 'soul_fire')) {
          await bot.dig(b, true);
        }
      } catch (e) {}
    }
  }
};

// Equip offhand shield and best weapon
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
  await lib.equipWeapon();
} catch (e) {}

// Step 1: Step through base door and enter Nether portal
if (bot.game.dimension === 'overworld') {
  if (bot.entity.position.z < -54.2) {
    console.log('Exiting through base door...');
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  }

  const moves = new Movements(bot, mcData);
  moves.canDig = false;
  moves.allowParkour = true;
  bot.pathfinder.setMovements(moves);

  console.log('Pathfinding to Nether Portal at (299, 73, -54)...');
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
  } catch (e) {
    console.log('GoalBlock fallback:', e.message);
    const center = new Vec3(299.5, 73.5, -54.0);
    await bot.lookAt(center, true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
    await sleep(800);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }

  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  console.log('Holding in portal block for warp...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 16000 && !checkCancelled()) {
    const cur = bot.entity.position;
    if (Math.abs(cur.x - 299.5) > 0.6 || Math.abs(cur.z - (-54.0)) > 0.6 || cur.y < 72.8) {
      await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
      bot.setControlState('forward', true);
      if (cur.y < 72.8) bot.setControlState('jump', true);
      await sleep(300);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(250);
  }
}

console.log(`Dimension after warp: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

// Step 2: In Nether, extinguish fire and march to Fortress Bunker at (44, 65, -127)
if (bot.game.dimension === 'the_nether') {
  await extinguishNearbyFire(6);

  const netherMoves = new Movements(bot, mcData);
  if (mcData.blocksByName.fire) netherMoves.blocksToAvoid.add(mcData.blocksByName.fire.id);
  if (mcData.blocksByName.soul_fire) netherMoves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
  if (mcData.blocksByName.lava) netherMoves.blocksToAvoid.add(mcData.blocksByName.lava.id);
  netherMoves.canDig = true;
  netherMoves.allowParkour = false;
  bot.pathfinder.setMovements(netherMoves);

  bot.chat(`delta: In Nether holding 2 gold ingots! Marching to Fortress Bunker (44, 65, -127) to deliver gold to Gamma & Beta for bartering!`);

  // Step out of Nether portal frame into bunker at (42, 65, -5)
  if (bot.entity.position.distanceTo(new Vec3(46.5, 66.0, 2.0)) < 4.0) {
    console.log('Stepping out of portal frame...');
    await bot.lookAt(new Vec3(42.0, 65.0, -5.0), true);
    bot.setControlState('forward', true);
    await sleep(1500);
    bot.setControlState('forward', false);
    await extinguishNearbyFire(5);
  }

  // Safe East Ridge waypoints up to WP 15: (44, 65, -127)
  const WAYPOINTS = [
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
    { x: 44, y: 65, z: -127 } // Fortress Outpost Bunker (Gamma is here!)
  ];

  let startIdx = 0;
  for (let i = 0; i < WAYPOINTS.length; i++) {
    const wp = WAYPOINTS[i];
    if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 4.5) {
      startIdx = i + 1;
    }
  }

  console.log(`Marching from WP ${startIdx} to WP ${WAYPOINTS.length}...`);
  let goldDelivered = false;

  for (let i = startIdx; i < WAYPOINTS.length && !checkCancelled(); i++) {
    if (bot.game.dimension !== 'the_nether') break;

    const wp = WAYPOINTS[i];
    console.log(`--> Advancing to WP ${i + 1}/${WAYPOINTS.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);

    await extinguishNearbyFire(5);

    // Keep gaze low to avoid Enderman aggro
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

    bot.deactivateItem();
    bot.setControlState('sneak', false);

    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    } catch (e) {
      try {
        await extinguishNearbyFire(5);
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
      } catch (e2) {}
    }

    try { await lib.pickup(3.5); } catch (e) {}

    // Check for Gamma or Beta
    for (const name of ['gamma', 'beta']) {
      const p = bot.players[name];
      if (p && p.entity) {
        const d = bot.entity.position.distanceTo(p.entity.position);
        if (d <= 5.0 && lib.count('gold_ingot') > 0 && !goldDelivered) {
          console.log(`Teammate ${name} (with golden_boots) within 5m at ${lib.fmt(p.entity.position)}! Tossing 2 gold ingots...`);
          await bot.lookAt(p.entity.position.offset(0, 1.2, 0), true);
          const ingots = bot.inventory.items().find(it => it.name === 'gold_ingot');
          if (ingots) {
            await bot.toss(ingots.type, null, ingots.count);
            goldDelivered = true;
            bot.chat(`delta: Delivered ${ingots.count} gold ingots to ${name} for Piglin bartering!`);
            console.log(`Delivered gold to ${name}!`);
          }
        }
      }
    }

    if (bot.health <= 8) {
      console.log(`HP low (${bot.health}), sheltering.`);
      bot.activateItem(true);
      break;
    }
  }

  console.log(`=== ARRIVED AT FORTRESS BUNKER ===`);
  console.log(`Current pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

  // In bunker: check for teammates again to deliver gold if not done yet
  if (!goldDelivered && lib.count('gold_ingot') > 0) {
    for (const name of ['gamma', 'beta', 'alpha']) {
      const p = bot.players[name];
      if (p && p.entity && bot.entity.position.distanceTo(p.entity.position) <= 6.0) {
        console.log(`Delivering gold to ${name} in bunker...`);
        await bot.lookAt(p.entity.position.offset(0, 1.2, 0), true);
        const ingots = bot.inventory.items().find(it => it.name === 'gold_ingot');
        if (ingots) {
          await bot.toss(ingots.type, null, ingots.count);
          goldDelivered = true;
          bot.chat(`delta: Delivered ${ingots.count} gold ingots to ${name} in bunker!`);
        }
        break;
      }
    }
  }

  // Vacuum around bunker
  try { await lib.pickup(6.0); } catch (e) {}

  // Stay guarded in bunker facing doorway
  await bot.lookAt(new Vec3(44.0, 65.0, -126.0), true);
  bot.activateItem(true); // raise shield
}

console.log(`=== BUNKER RUN COMPLETE ===`);
console.log(`Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);
console.log(`Ender Pearls: ${lib.count('ender_pearl')}/12, Gold ingots: ${lib.count('gold_ingot')}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  pearls: lib.count('ender_pearl'),
  gold: lib.count('gold_ingot'),
  inv: lib.inv()
};
