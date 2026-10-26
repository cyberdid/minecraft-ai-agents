// programs/463-transit-to-nether-and-advance.js
console.log('=== Program 463: Transit to Nether & Advance to Fortress ===');
console.log('Alpha start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Step out of base door if inside
if (bot.game.dimension === 'overworld') {
  if (bot.entity.position.z < -53) {
    console.log('Exiting base door...');
    try {
      await passDoorOut();
    } catch (e) {
      try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
    }
  }

  // 2. Walk to portal at (299, 73, -54)
  console.log('Walking into portal at (299.5, 73.0, -54.0)...');
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
  } catch (e) {
    await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
    bot.setControlState('forward', true);
    bot.setControlState('jump', true);
    await sleep(800);
    bot.setControlState('jump', false);
    await sleep(400);
    bot.setControlState('forward', false);
  }

  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  // 3. Wait for dimension transit
  console.log('Waiting stationary in portal for dimension transit...');
  for (let wait = 0; wait < 25; wait++) {
    if (bot.game.dimension === 'the_nether') break;
    await sleep(500);
  }
}

console.log('Dimension:', bot.game.dimension);
console.log('Alpha at:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat(`team: Alpha entered the Nether at ${lib.fmt(bot.entity.position)}! Marching along East Ridge to Fortress Workshop (44, 65, -128)!`);

  // Helper to clear fire in path
  async function clearFire() {
    const fires = bot.findBlocks({
      matching: b => b.name === 'fire' || b.name === 'soul_fire',
      maxDistance: 6,
      count: 6
    });
    for (const fp of fires) {
      try {
        const b = bot.blockAt(fp);
        if (b) await bot.dig(b);
      } catch (e) {}
    }
  }

  // Waypoints along verified East Ridge trail
  const waypoints = [
    { x: 63, y: 64, z: -3 },
    { x: 62, y: 66, z: -30 },
    { x: 61, y: 67, z: -60 },
    { x: 54, y: 65, z: -90 },
    { x: 44, y: 65, z: -128 }
  ];

  for (const wp of waypoints) {
    if (isCancelled()) break;
    console.log(`Advancing towards waypoint (${wp.x}, ${wp.y}, ${wp.z})...`);
    await clearFire();
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 15000 });
    } catch (e) {
      try { await lib.goToXZ(wp.x, wp.z); } catch (e2) {
        console.log(`Failed waypoint (${wp.x}, ${wp.z}):`, e2.message);
      }
    }
    console.log(`Current pos: ${lib.fmt(bot.entity.position)}`);
  }

  // Advance along covered advance tunnel to z=-147
  if (bot.entity.position.z < -120) {
    console.log('Entering covered advance tunnel towards z=-147...');
    try {
      await lib.goTo(44, 65, -147, 1, { timeoutMs: 15000 });
    } catch (e) {
      try { await lib.goToXZ(44, -147); } catch (e2) {}
    }
  }

  console.log('Alpha final position:', lib.fmt(bot.entity.position));
  bot.chat(`team: Alpha at ${lib.fmt(bot.entity.position)}! Ready to breach mountain to Blaze Spawner at (32, 68, -190)!`);
}

console.log('SUMMARY:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
