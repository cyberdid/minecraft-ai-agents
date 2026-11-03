// programs/792-clear-and-walk-south.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 792: Clear Tight Corridor & Walk South ===');
console.log('Initial Pos:', lib.fmt(bot.entity.position));

// Dig any blocks obstructing a 2-high clearance at x=62..63, y=65..66 from z=-34 to z=-20
for (let z = -34; z <= -20 && !isCancelled(); z++) {
  for (let x = 62; x <= 63; x++) {
    // Floor should be at y=64. Clearance at y=65 and y=66.
    for (let y of [65, 66]) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.boundingBox === 'block') {
        console.log(`Clearing obstruction at (${x}, ${y}, ${z}): ${b.name}`);
        try {
          await bot.dig(b, true);
        } catch (e) {
          console.log(`Dig error at (${x}, ${y}, ${z}):`, e.message);
        }
      }
    }
  }

  // Also verify floor exists at y=64 or y=63
  const floor64 = bot.blockAt(new Vec3(63, 64, z));
  const floor63 = bot.blockAt(new Vec3(63, 63, z));
  if ((!floor64 || floor64.boundingBox !== 'block') && (!floor63 || floor63.boundingBox !== 'block')) {
    console.log(`Hole detected at (63, 64, ${z})! Placing cobblestone/netherrack floor.`);
    try {
      await lib.place(63, 64, z, 'cobblestone');
    } catch (e) {
      try { await lib.place(63, 64, z, 'netherrack'); } catch (e2) {}
    }
  }

  // Extinguish any fire nearby
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 5,
    count: 5
  });
  for (const fp of fires) {
    try {
      const fb = bot.blockAt(fp);
      if (fb) await bot.dig(fb, true);
    } catch (e) {}
  }

  // Walk forward to this z position
  const target = new Vec3(63.0, 65.0, z);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(target.x, target.y, target.z, 0.8));
  } catch (e) {
    // Fallback: direct controls
    await bot.lookAt(target, true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < target.y) bot.setControlState('jump', true);
    await sleep(400);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }
}

console.log('Pos after traversing to z=-20:', lib.fmt(bot.entity.position));
return { pos: bot.entity.position, hp: bot.health, food: bot.food };
