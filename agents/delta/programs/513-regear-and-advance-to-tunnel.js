// programs/513-regear-and-advance-to-tunnel.js
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('=== DELTA: REGEAR & ADVANCE TO COVERED TUNNEL ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, Dim: ${bot.game.dimension}`);

// 1. Inspect Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const chestItems = chest.containerItems();
    console.log('Base Chest items:', chestItems.map(i => `${i.name} x${i.count}`).join(', '));

    // Withdraw any gold_ingot or gold_nugget
    for (const name of ['gold_ingot', 'gold_nugget', 'cobblestone']) {
      const item = chestItems.find(i => i.name === name);
      if (item && name === 'cobblestone' && lib.count('cobblestone') < 16) {
        const take = Math.min(item.count, 16 - lib.count('cobblestone'));
        await chest.withdraw(item.type, null, take);
        console.log(`Withdrew ${take} ${name} from Base Chest.`);
      } else if (item && (name === 'gold_ingot' || name === 'gold_nugget')) {
        await chest.withdraw(item.type, null, item.count);
        console.log(`Withdrew ${item.count} ${name} from Base Chest.`);
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest interaction:', e.message);
  }
}

// Ensure shield in offhand and stone sword
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
  await lib.equipWeapon();
} catch (e) {}

console.log('Current Delta inventory:', lib.inv());

// 2. Step outside base door to portal (299.5, 73, -54)
if (bot.game.dimension === 'overworld') {
  if (bot.entity.position.z < -54.2) {
    console.log('Exiting through base door...');
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  }

  console.log('Entering Nether Portal (299.5, 73, -54)...');
  await globalThis.enterNetherPortal();
}

console.log(`Dimension now: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

if (bot.game.dimension === 'the_nether') {
  globalThis.configureFireAvoidance();
  bot.chat(`delta: In Nether! Marching to covered tunnel (44, 65, -145) to join Beta for Milestone 9 bartering!`);

  // Step out of Nether portal frame into bunker trench
  if (bot.entity.position.distanceTo(new Vec3(46.5, 66.0, 2.0)) < 4.0) {
    console.log('Stepping out of Nether portal into bunker...');
    await bot.lookAt(new Vec3(42.0, 65.0, -5.0), true);
    bot.setControlState('forward', true);
    await sleep(1200);
    bot.setControlState('forward', false);
  }

  // March waypoints directly to WP 16: (44, 65, -145)
  const targetWpIdx = 15; // 0-indexed WP 16
  let startIdx = 0;
  for (let i = 0; i < globalThis.NETHER_PILLBOX_WAYPOINTS.length; i++) {
    const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
    if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 3.5) {
      startIdx = i + 1;
    }
  }

  console.log(`Marching from WP ${startIdx} to WP ${targetWpIdx + 1} (covered tunnel)...`);

  let lastPearls = lib.count('ender_pearl');

  for (let i = startIdx; i <= targetWpIdx && !checkCancelled(); i++) {
    if (bot.game.dimension !== 'the_nether') break;

    const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
    console.log(`--> Advancing to WP ${i + 1}/${globalThis.NETHER_PILLBOX_WAYPOINTS.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);

    await globalThis.clearFireAhead();

    // Look low to avoid Enderman aggro
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

    bot.deactivateItem();
    bot.setControlState('sneak', false);

    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    } catch (e) {
      try {
        await globalThis.clearFireAhead();
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
      } catch (e2) {}
    }

    // Vacuum drops along the way
    try { await lib.pickup(3.5); } catch (e) {}

    // Check for teammates
    for (const name of ['beta', 'gamma', 'alpha']) {
      const p = bot.players[name];
      if (p && p.entity && bot.entity.position.distanceTo(p.entity.position) <= 6.0) {
        console.log(`Teammate ${name} within 6m at ${lib.fmt(p.entity.position)}!`);
        // If holding gold ingot and teammate is Beta/Gamma (wearing golden_boots), toss gold to them!
        if (lib.count('gold_ingot') > 0 && (name === 'beta' || name === 'gamma')) {
          const ingot = bot.inventory.items().find(it => it.name === 'gold_ingot');
          if (ingot) {
            console.log(`Tossing gold_ingot to ${name}...`);
            await bot.lookAt(p.entity.position.offset(0, 1.2, 0), true);
            await bot.toss(ingot.type, null, ingot.count);
            bot.chat(`delta: Tossed gold ingot to ${name} for Piglin bartering!`);
          }
        }
      }
    }

    const curPearls = lib.count('ender_pearl');
    if (curPearls > lastPearls) {
      lastPearls = curPearls;
      bot.chat(`delta: Picked up Ender Pearl! Total held: ${curPearls}/12`);
    }

    if (bot.health <= 8) {
      console.log(`Delta HP low (${bot.health}), taking shelter.`);
      break;
    }
  }

  console.log(`Reached Covered Tunnel area! Current pos: ${lib.fmt(bot.entity.position)}`);

  // Vacuum around tunnel for barter drops
  try { await lib.pickup(6.0); } catch (e) {}
}

const finalPearls = lib.count('ender_pearl');
console.log(`Delta finished advance. Ender Pearls held: ${finalPearls}/12, HP: ${bot.health}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls: finalPearls,
  inv: lib.inv()
};
