// programs/778-enter-nether-and-march-to-safe-barter.js
console.log('=== Program 778: Enter Nether & March Safe Tunnel to Barter ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Step 1: Walk to portal in Overworld
if (bot.game.dimension === 'overworld') {
  console.log('Walking to portal frame at (298.5, 73, -54)...');
  try {
    await lib.goTo(298.5, 73.0, -53.5, 1.0, { timeoutMs: 5000 });
  } catch (e) {}

  const portals = bot.findBlocks({
    matching: b => b && b.name === 'nether_portal',
    maxDistance: 6,
    count: 10
  });

  if (portals.length === 0) throw new Error('No portal blocks found');

  portals.sort((a, b) => a.y - b.y || bot.entity.position.distanceTo(a) - bot.entity.position.distanceTo(b));
  const targetPortal = portals[0];
  console.log('Entering portal block at:', lib.fmt(targetPortal));

  const pCenter = targetPortal.offset(0.5, 0.2, 0.5);
  await bot.lookAt(pCenter, true);
  bot.setControlState('forward', true);
  if (bot.entity.position.y < targetPortal.y) bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);

  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
    const cur = bot.entity.position;
    if (Math.abs(cur.x - pCenter.x) > 0.4 || Math.abs(cur.z - pCenter.z) > 0.4 || cur.y < targetPortal.y - 0.2) {
      await bot.lookAt(pCenter, true);
      bot.setControlState('forward', true);
      if (cur.y < targetPortal.y) bot.setControlState('jump', true);
      await sleep(150);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(250);
  }
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to warp; still in ${bot.game.dimension}`);
}

console.log('SUCCESS: Beta in the_nether at:', lib.fmt(bot.entity.position));
bot.activateItem(true); // Raise shield against Ghasts!
if (typeof configureFireAvoidance === 'function') configureFireAvoidance();

// Verify golden_boots
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
console.log('Feet armor slot:', bot.inventory.slots[8]?.name);

bot.chat(`Beta: In Nether with ${lib.count('gold_ingot')} gold ingots, full HP & golden_boots! Marching covered tunnel to barter!`);

// Safe waypoints through covered tunnel directly to cross-bridge (38, 65, -176)
const safeTunnelWaypoints = [
  new Vec3(46, 65, -7),
  new Vec3(56, 65, -7),
  new Vec3(63, 64, -7),
  new Vec3(63, 65, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61.5, 67, -70),
  new Vec3(62.0, 67, -80),
  new Vec3(61.0, 66, -100),
  new Vec3(50.0, 65, -115),
  new Vec3(44.0, 65, -127), // Fortress Workshop Bunker
  new Vec3(44.0, 65, -145), // Covered tunnel
  new Vec3(44.0, 65, -160),
  new Vec3(44.0, 65, -169), // Blast wall
  new Vec3(38.0, 65, -176)  // Cross bridge / Courtyard
];

let bartersDone = 0;
let initialPearls = lib.count('ender_pearl');

for (let i = 0; i < safeTunnelWaypoints.length && !isCancelled(); i++) {
  const wp = safeTunnelWaypoints[i];
  console.log(`Marching to WP ${i + 1}/${safeTunnelWaypoints.length}: ${lib.fmt(wp)}...`);
  if (typeof globalThis.clearFireAhead === 'function') await globalThis.clearFireAhead();

  // Past z=-50: keep shield raised
  bot.activateItem(true);
  if (wp.z <= -110) bot.setControlState('sneak', true);

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.8));
    } catch (e2) {}
  }

  // Scan for adult Piglins within 18m along this safe walkway
  const piglins = Object.values(bot.entities).filter(e =>
    e.name === 'piglin' &&
    e.isValid &&
    bot.entity.position.distanceTo(e.position) <= 18
  );

  if (piglins.length > 0 && lib.count('gold_ingot') > 0) {
    piglins.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
    const targetPiglin = piglins[0];
    const dist = bot.entity.position.distanceTo(targetPiglin.position);
    console.log(`Adult Piglin nearby at ${lib.fmt(targetPiglin.position)} (dist: ${dist.toFixed(1)}m)! Bartering...`);
    bot.chat('Beta: Tossing gold ingot to neutral Piglin for Milestone 9 barter!');

    try {
      await bot.lookAt(targetPiglin.position.offset(0, 1.2, 0), true);
      await bot.toss(mcData.itemsByName.gold_ingot.id, null, 1);
      bartersDone++;

      console.log('Holding position with shield raised for 8.5s...');
      bot.activateItem(true);
      await sleep(8500);

      await lib.pickup(5.0);
      const newPearls = lib.count('ender_pearl');
      console.log(`Ender Pearls count: ${newPearls}`);

      if (newPearls > initialPearls) {
        bot.chat(`Beta: GOT ENDER PEARL FROM BARTER! Total: ${newPearls}/12!`);
        initialPearls = newPearls;
      }
    } catch (err) {
      console.log('Barter note:', err.message);
    }
  }

  if (bot.health <= 6) {
    console.log(`Health low (${bot.health}), holding at cover.`);
    break;
  }
}

bot.setControlState('sneak', false);
await lib.pickup(5.0);
bot.activateItem(true); // Keep shield raised

console.log('=== Program 778 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Ender Pearls on Beta:', lib.count('ender_pearl'));
console.log('Gold ingots:', lib.count('gold_ingot'));
console.log('Barters performed:', bartersDone);
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  ender_pearls: lib.count('ender_pearl'),
  gold_ingots: lib.count('gold_ingot'),
  barters_done: bartersDone
};
