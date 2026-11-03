// programs/515-enter-portal-and-join-team.js
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('=== DELTA: PORTAL WARP & ADVANCE TO COVERED TUNNEL ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, Dim: ${bot.game.dimension}`);

bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

// Ensure offhand shield and weapon
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
  await lib.equipWeapon();
} catch (e) {}

// Step 1: Warp to Nether if in Overworld
if (bot.game.dimension === 'overworld') {
  const moves = new Movements(bot, mcData);
  moves.canDig = false;
  moves.allowParkour = true;
  bot.pathfinder.setMovements(moves);

  console.log('Pathfinding to GoalBlock(299, 73, -54)...');
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
    console.log('Inside portal block! Pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('GoalBlock note:', e.message);
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

  console.log('Waiting for Nether warp...');
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

// Step 2: In Nether, advance to Covered Tunnel
if (bot.game.dimension === 'the_nether') {
  globalThis.configureFireAvoidance();
  bot.chat(`delta: In Nether! Advancing along safe waypoints to Covered Tunnel (44, 65, -145) to assist with Milestone 9 Piglin bartering!`);

  // Step forward out of Nether portal frame into bunker
  if (bot.entity.position.distanceTo(new Vec3(46.5, 66.0, 2.0)) < 4.0) {
    console.log('Stepping out of portal frame into bunker...');
    await bot.lookAt(new Vec3(42.0, 65.0, -5.0), true);
    bot.setControlState('forward', true);
    await sleep(1500);
    bot.setControlState('forward', false);
  }

  // Determine starting waypoint
  let startIdx = 0;
  for (let i = 0; i < globalThis.NETHER_PILLBOX_WAYPOINTS.length; i++) {
    const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
    if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 4.0) {
      startIdx = i + 1;
    }
  }

  const targetWpIdx = 15; // WP 16: (44, 65, -145)
  console.log(`Marching from WP ${startIdx} to WP ${targetWpIdx + 1} (covered tunnel)...`);

  let pearlsHeld = lib.count('ender_pearl');

  for (let i = startIdx; i <= targetWpIdx && !checkCancelled(); i++) {
    if (bot.game.dimension !== 'the_nether') break;

    const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
    console.log(`--> Moving to WP ${i + 1}/${globalThis.NETHER_PILLBOX_WAYPOINTS.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);

    await globalThis.clearFireAhead();

    // Look low to avoid Enderman aggro
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

    bot.deactivateItem();
    bot.setControlState('sneak', false);

    // If past z <= -165: sneak with shield
    if (wp.z <= -165) {
      bot.setControlState('sneak', true);
      bot.activateItem(true);
    }

    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    } catch (e) {
      try {
        await globalThis.clearFireAhead();
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
      } catch (e2) {}
    }

    // Vacuum drops along trail
    try { await lib.pickup(3.5); } catch (e) {}

    // Check for nearby teammates
    for (const name of ['beta', 'gamma', 'alpha']) {
      const p = bot.players[name];
      if (p && p.entity) {
        const d = bot.entity.position.distanceTo(p.entity.position);
        if (d <= 8.0) {
          console.log(`Teammate ${name} nearby at ${lib.fmt(p.entity.position)} (dist: ${d.toFixed(1)}m)!`);
        }
      }
    }

    // Check for dropped Ender Pearls nearby
    const items = Object.values(bot.entities).filter(e =>
      e.name === 'item' &&
      bot.entity.position.distanceTo(e.position) <= 5.0
    );
    if (items.length > 0) {
      for (const item of items) {
        try {
          await bot.pathfinder.goto(new goals.GoalNear(item.position.x, item.position.y, item.position.z, 0.5));
        } catch (e) {}
      }
    }

    const curPearls = lib.count('ender_pearl');
    if (curPearls > pearlsHeld) {
      pearlsHeld = curPearls;
      bot.chat(`delta: Acquired Ender Pearl! Delta holds ${pearlsHeld}/12 pearls!`);
    }

    if (bot.health <= 8) {
      console.log(`HP low (${bot.health}), pausing in safe cover.`);
      bot.activateItem(true);
      break;
    }
  }

  // Vacuum around covered tunnel destination
  try { await lib.pickup(6.0); } catch (e) {}
}

const finalPearls = lib.count('ender_pearl');
console.log(`=== ADVANCE COMPLETE ===`);
console.log(`Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);
console.log(`Ender Pearls: ${finalPearls}/12, Inv:`, lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls: finalPearls,
  inv: lib.inv()
};
