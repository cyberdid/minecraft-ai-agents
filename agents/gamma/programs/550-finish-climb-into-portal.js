// programs/550-finish-climb-into-portal.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 550: FINISH CLIMB DIRECTLY INTO PORTAL ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Equip iron pickaxe
const pick = bot.inventory.items().find(i => i.name === 'iron_pickaxe') ||
             bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Step 2: Dig and jump-place cobblestone up to y=73.0
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');

while (bot.entity.position.y < 72.8 && !isCancelled() && bot.game.dimension === 'overworld') {
  const curY = Math.floor(bot.entity.position.y);
  
  // Dig 2 blocks above head if solid
  for (let dy of [2, 3]) {
    const b = bot.blockAt(bot.entity.position.offset(0, dy, 0));
    if (b && b.name !== 'air' && b.name !== 'nether_portal') {
      try {
        if (pick) await bot.equip(pick, 'hand');
        await bot.dig(b);
      } catch (e) {}
    }
  }

  // Jump and place underfoot
  if (cobble) {
    await bot.equip(cobble, 'hand');
    bot.setControlState('jump', true);
    await sleep(350);
    bot.setControlState('jump', false);

    const floor = bot.blockAt(bot.entity.position.offset(0, -1, 0));
    if (floor && floor.boundingBox === 'block') {
      try {
        await bot.placeBlock(floor, new Vec3(0, 1, 0));
      } catch (e) {}
    }
    await sleep(150);
  }
}

bot.clearControlStates();
console.log('Reached surface height! Pos:', lib.fmt(bot.entity.position));

// Step 3: Stand inside portal frame and await warp
bot.chat('gamma: Inside Nether portal frame at (299.5, 73, -53.5)! Warping to Nether...');
const warpStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
  await sleep(300);
}

if (bot.game.dimension === 'the_nether') {
  console.log('SUCCESS: Warped to the_nether! Pos:', lib.fmt(bot.entity.position));
  await sleep(400);
  await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);

  bot.chat(`gamma: Inside the_nether at ${lib.fmt(bot.entity.position)}! HP: ${bot.health}/20. Marching to Bunker (44, 65, -127)!`);

  // Step 4: Fast march to Bunker (WP 0 -> WP 11)
  globalThis.configureFireAvoidance();
  const bunkerWps = [
    { x: 46, y: 65, z: -7 },
    { x: 54, y: 65, z: -7 },
    { x: 63, y: 64, z: -7 },
    { x: 63, y: 65, z: -20 },
    { x: 63, y: 66, z: -35 },
    { x: 62, y: 67, z: -50 },
    { x: 61.5, y: 67, z: -60 },
    { x: 61.5, y: 67, z: -70 },
    { x: 62, y: 67, z: -80 },
    { x: 61, y: 66, z: -100 },
    { x: 50, y: 65, z: -115 },
    { x: 44, y: 65, z: -127 }
  ];

  let startIdx = 0;
  let closestDist = Infinity;
  for (let i = 0; i < bunkerWps.length; i++) {
    const d = bot.entity.position.distanceTo(new Vec3(bunkerWps[i].x, bunkerWps[i].y, bunkerWps[i].z));
    if (d < closestDist) {
      closestDist = d;
      startIdx = i;
    }
  }
  if (closestDist < 2.0 && startIdx < bunkerWps.length - 1) startIdx++;

  for (let i = startIdx; i < bunkerWps.length && !isCancelled(); i++) {
    const wp = bunkerWps[i];
    const target = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(target) < 2.0) continue;

    await globalThis.clearFireAhead();
    if (wp.z <= -95) bot.activateItem(true);
    else bot.deactivateItem();

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

    if (bot.health <= 6) break;
  }

  console.log('Arrived at Bunker! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
  bot.chat(`gamma: Stationed at Fortress Workshop Bunker (${lib.fmt(bot.entity.position)})! HP: ${bot.health.toFixed(1)}/20.`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
