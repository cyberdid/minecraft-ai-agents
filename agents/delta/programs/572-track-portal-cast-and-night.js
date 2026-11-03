// programs/572-track-portal-cast-and-night.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: TRACK PORTAL CAST & NIGHT PROTOCOL ===');
console.log(`Pos: ${lib.fmt(bot.entity.position)}, TimeOfDay: ${bot.time.timeOfDay}`);

const start = Date.now();
let portalBlock = null;

while (!isCancelled() && Date.now() - start < 35000) {
  // 1. Check if portal is lit
  portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 10 });
  if (portalBlock) {
    console.log(`PORTAL IS LIT AT ${lib.fmt(portalBlock.position)}!`);
    bot.chat('delta: NETHER PORTAL IS IGNITED! Warping into the_nether now!');
    break;
  }

  // 2. Check sill block
  const sill = bot.blockAt(new Vec3(299, 72, -54));
  if (sill && sill.name === 'obsidian') {
    console.log('Obsidian cast complete! Waiting for ignition...');
  }

  // 3. Check night protocol (tick >= 12542)
  const t = bot.time.timeOfDay;
  if (t >= 12542 && t <= 23460) {
    console.log(`Dusk / Night active (timeOfDay=${t})! Checking base bed...`);
    const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 8 });
    if (bed) {
      try {
        await bot.sleep(bed);
        console.log('Sleeping in bed...');
        while (bot.isSleeping && !isCancelled()) {
          await sleep(500);
        }
        console.log('Morning arrived! Night skipped.');
        break;
      } catch (err) {
        console.log('Sleep notice:', err.message);
      }
    }
  }

  await sleep(800);
}

// If portal lit, enter!
if (portalBlock) {
  const pPos = portalBlock.position.offset(0.5, 0, 0.5);
  await bot.lookAt(pPos, true);
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(portalBlock.position.x, portalBlock.position.y, portalBlock.position.z));
  } catch (e) {
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);
  }

  console.log('Inside portal block, standing motionless to warp...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
    await sleep(400);
  }

  if (bot.game.dimension === 'the_nether') {
    configureFireAvoidance();
    bot.chat('delta: Successfully warped into the_nether! Advancing along safe waypoints to Fortress Bunker (44, 65, -127)!');
  }
}

// Report positions of teammates
for (const name of ['alpha', 'beta', 'gamma']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
  }
}

const finalSill = bot.blockAt(new Vec3(299, 72, -54));
return {
  portalActive: !!portalBlock,
  sillBlock: finalSill?.name,
  dimension: bot.game.dimension,
  time: bot.time.timeOfDay,
  pos: bot.entity.position
};
