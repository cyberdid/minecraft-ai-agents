// programs/443-craft-shield-and-nether-assault.js
globalThis.isCancelled = isCancelled;

console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Craft birch_planks from birch_log
if (lib.count('*_planks') < 6 && lib.count('birch_log') > 0) {
  console.log('Crafting birch_planks...');
  try {
    await lib.craft('birch_planks', 8);
    console.log('Planks count:', lib.count('*_planks'));
  } catch (e) {
    console.log('Planks craft note:', e.message);
  }
}

// 2. Craft shield (1 iron ingot + 6 planks)
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting shield at crafting table...');
  try {
    await lib.craft('shield', 1);
    console.log('SHIELD CRAFTED SUCCESSFULLY!');
  } catch (e) {
    console.log('Craft shield note:', e.message);
  }
}

// 3. Equip shield in offhand
try {
  await lib.equipArmor();
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) {
    await bot.equip(shield, 'off-hand');
    console.log('Shield equipped in offhand!');
  }
} catch (e) {
  console.log('Equip shield error:', e.message);
}

// Equip stone sword in main hand
try { await lib.equipWeapon(); } catch (e) {}

const offhand = bot.inventory.slots[45];
console.log('Offhand slot 45:', offhand?.name, 'Held:', bot.heldItem?.name);

if (offhand?.name === 'shield') {
  bot.chat('delta: Full Kit Active! Shield in offhand + Stone Sword! Invulnerable to fireballs!');
}

// 4. Enter Nether Portal
if (bot.game.dimension === 'overworld') {
  console.log('Entering Nether Portal (299.5, 73, -54)...');
  const moves = new Movements(bot, mcData);
  moves.canDig = false;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);

  try {
    await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -54.0, 0.6));
  } catch (e) {}

  const portalBlock = new Vec3(299.5, 73.0, -54.0);
  if (bot.entity.position.distanceTo(portalBlock) > 0.8) {
    await bot.lookAt(portalBlock.offset(0, 0.5, 0), true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
    await sleep(600);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }

  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
    await sleep(400);
  }
}

console.log('Dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

// 5. March to Spawner Pillbox
if (bot.game.dimension === 'the_nether') {
  bot.chat('delta: In Nether with Shield! Marching to Spawner Pillbox (36.5, 66, -187) to claim Milestone 8!');

  if (bot.entity.position.distanceTo(new Vec3(40, 65, -7)) < 5.0) {
    await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
    bot.setControlState('forward', true);
    await sleep(1000);
    bot.setControlState('forward', false);
  }

  const moves = new Movements(bot, mcData);
  const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
  for (const id of fireIds) moves.blocksToAvoid.add(id);
  if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
  moves.canDig = false;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);

  const WAYPOINTS = [
    { x: 46, y: 65, z: -7 },   // 0
    { x: 54, y: 65, z: -7 },   // 1
    { x: 63, y: 64, z: -7 },   // 2
    { x: 63, y: 65, z: -20 },  // 3
    { x: 63, y: 66, z: -35 },  // 4
    { x: 62, y: 67, z: -50 },  // 5
    { x: 61, y: 67, z: -65 },  // 6
    { x: 62, y: 67, z: -80 },  // 7
    { x: 61, y: 66, z: -100 }, // 8
    { x: 50, y: 65, z: -115 }, // 9
    { x: 44, y: 65, z: -127 }, // 10
    { x: 44, y: 65, z: -145 }, // 11
    { x: 44, y: 65, z: -160 }, // 12
    { x: 44, y: 65, z: -169 }, // 13
    { x: 38, y: 65, z: -176 }, // 14
    { x: 36.5, y: 66, z: -187 } // 15 (Inside Pillbox under roof)
  ];

  let startIdx = 0;
  for (let i = 0; i < WAYPOINTS.length; i++) {
    if (bot.entity.position.distanceTo(new Vec3(WAYPOINTS[i].x, WAYPOINTS[i].y, WAYPOINTS[i].z)) < 3.5) {
      startIdx = i + 1;
    }
  }

  console.log(`Marching from WP ${startIdx} to Pillbox...`);
  for (let i = startIdx; i < WAYPOINTS.length && !isCancelled(); i++) {
    const wp = WAYPOINTS[i];
    const target = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(target) < 2.5) continue;

    let timer = null;
    try {
      await Promise.race([
        bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8)),
        new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('timeout')), 10000); })
      ]);
    } catch (e) {
      try {
        await bot.lookAt(target.offset(0.5, 1, 0.5), true);
        bot.setControlState('forward', true);
        if (target.y > bot.entity.position.y) bot.setControlState('jump', true);
        await sleep(1500);
        bot.setControlState('jump', false);
        bot.setControlState('forward', false);
      } catch (e2) {}
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  console.log('March complete. Position:', lib.fmt(bot.entity.position), 'HP:', bot.health);

  // 6. Shield-Defended Combat at Pillbox (36.5, 66.0, -187.0)
  const distToPillbox = bot.entity.position.distanceTo(new Vec3(36.5, 66.0, -187.0));
  if (distToPillbox < 6.0) {
    bot.chat('delta: In Spawner Pillbox with Shield! Slaying Blazes for Milestone 8 (Blaze Rods).');
    bot.pathfinder.stop();
    bot.pathfinder.setGoal(null);
    bot.clearControlStates();

    // Lock strictly into covered bunker spot: (36.5, 66.0, -187.0)
    try {
      await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -187.0, 0.5));
    } catch (e) {}

    // Raise shield immediately
    bot.activateItem(true);
    console.log('Shield raised in offhand!');

    const farmDurationMs = 180000;
    const startTime = Date.now();
    let lastRods = lib.count('blaze_rod');
    let lastAttack = 0;
    let hits = 0;

    console.log(`Shielded combat active. Starting rods: ${lastRods}`);

    while (!isCancelled() && Date.now() - startTime < farmDurationMs) {
      // Find nearest blaze within 5.0m
      const blazes = Object.values(bot.entities)
        .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
        .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

      const target = blazes[0];
      if (target) {
        const dist = bot.entity.position.distanceTo(target.position);
        if (dist <= 4.8 && Date.now() - lastAttack > 625) {
          // Lower shield momentarily to strike, then re-raise
          bot.deactivateItem();
          try { await lib.equipWeapon(); } catch (e) {}
          await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
          bot.attack(target);
          lastAttack = Date.now();
          hits++;
          console.log(`Hit Blaze at dist ${dist.toFixed(1)}m (hit #${hits})`);
          await sleep(50);
          bot.activateItem(true); // shield back up!
        }
      }

      // Safe pickup (stay inside pillbox: x >= 36.0, z <= -186.0)
      const safeItems = Object.values(bot.entities).filter(e => 
        e.name === 'item' && 
        bot.entity.position.distanceTo(e.position) <= 2.5 &&
        e.position.x >= 36.0 &&
        e.position.z <= -186.0
      );
      for (const item of safeItems) {
        try {
          await bot.pathfinder.goto(new goals.GoalNear(item.position.x, item.position.y, item.position.z, 0.4));
        } catch (e) {}
      }

      const curRods = lib.count('blaze_rod');
      if (curRods > lastRods) {
        bot.chat(`delta: Harvested Blaze Rod! Total: ${curRods}/8`);
        console.log(`Harvested Blaze Rod! Total: ${curRods}/8`);
        lastRods = curRods;
      }

      if (curRods >= 8) {
        console.log('Milestone 8 target reached: 8+ Blaze Rods!');
        break;
      }

      await sleep(100);
    }

    const totalRods = lib.count('blaze_rod');
    console.log(`Combat cycle end. Total hits: ${hits}, Rods: ${totalRods}/8, HP: ${bot.health}`);
    bot.chat(`delta: Combat round complete. Blaze Rods held: ${totalRods}/8, HP: ${bot.health.toFixed(1)}`);

    if (totalRods >= 8) {
      bot.chat('delta: 8+ Blaze Rods secured! Retreating to Overworld base.');
      console.log('Retreating to Overworld base...');
      const retRes = await retreatToOverworldBase();
      console.log('Retreat result:', JSON.stringify(retRes));

      if (bot.game.dimension === 'overworld') {
        try {
          await lib.deposit({ blaze_rod: 'all' }, 293, 72, -57);
          bot.chat('delta: Deposited all Blaze Rods in base chest (293, 72, -57)! Milestone 8 COMPLETE!');
        } catch (e) {}
      }
    }
  }
}
