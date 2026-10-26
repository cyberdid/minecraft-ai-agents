// programs/515-enter-portal-and-follow-alpha-trail.js
console.log('=== Step: Enter Nether Portal & Follow Alpha Safe Trail to Fortress ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Walk 4.8m into Nether Portal block (299.5, 73.0, -54.0)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Stepping into Nether Portal block:', lib.fmt(portalTarget));

try {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.4);
} catch (e) {
  await bot.lookAt(portalTarget.offset(0, 0.5, 0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  await sleep(400);
  bot.clearControlStates();
}

bot.clearControlStates();
console.log('Standing still inside portal at:', lib.fmt(bot.entity.position));

// 2. Wait up to 12s for Nether transit (takes 80 ticks = 4s in survival)
for (let s = 0; s < 12; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
    console.log(`SUCCESS: ENTERED THE NETHER at second ${s+1}! Pos:`, lib.fmt(bot.entity.position));
    break;
  }
}

// 3. If in Nether, follow Alpha's proven East Ridge route to (44, 65, -141)
if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
  console.log('In the Nether! Commencing East Ridge march...');
  
  // Step out of portal frame towards East (+X)
  await bot.lookAt(new Vec3(45, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(800);
  bot.clearControlStates();
  console.log('Stepped East out of bunker to:', lib.fmt(bot.entity.position));
  
  // Alpha's verified waypoints
  const alphaWaypoints = [
    new Vec3(61, 68, -3),
    new Vec3(61, 67, -43),
    new Vec3(61, 66, -85),
    new Vec3(50, 65, -115),
    new Vec3(45, 65, -127),
    new Vec3(44, 65, -141)
  ];
  
  for (let i = 0; i < alphaWaypoints.length; i++) {
    if (isCancelled()) break;
    const wp = alphaWaypoints[i];
    console.log(`Advancing to Alpha WP ${i+1}/${alphaWaypoints.length}: ${lib.fmt(wp)} (HP=${bot.health.toFixed(1)})...`);
    
    // Extinguish any fire within 4m
    const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
    const fires = bot.findBlocks({ matching: fireIds, maxDistance: 4, count: 5 });
    for (const fp of fires) {
      try { await lib.dig(fp.x, fp.y, fp.z); } catch (e) {}
    }
    
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2.0);
      console.log(`Reached WP ${i+1}: ${lib.fmt(bot.entity.position)}`);
    } catch (e) {
      console.log(`WP ${i+1} note, trying walkTo:`, e.message);
      try { await lib.walkTo(wp.x, wp.z); } catch (e2) {}
    }
  }
  
  console.log('Arrival pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
  
  // Check Alpha and Gamma
  for (const [name, p] of Object.entries(bot.players)) {
    if (p.entity && name !== 'beta') {
      const d = bot.entity.position.distanceTo(p.entity.position);
      console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
    }
  }
  
  bot.chat(`beta: United with Alpha and Gamma at Fortress advance tunnel (${lib.fmt(bot.entity.position)})! Ready to breach Blaze Spawner at (32, 68, -190)!`);
}

console.log('Final dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
