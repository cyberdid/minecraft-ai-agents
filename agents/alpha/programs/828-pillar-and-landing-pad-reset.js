// programs/828-pillar-and-landing-pad-reset.js
console.log('=== Program 828: Pillar & Landing Pad Fall Reset ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (!cobble) {
  console.log('No cobble in inventory!');
} else {
  await bot.equip(cobble, 'hand');

  // Build vertical pillar at (46, y, -123) from y=26 to y=37
  for (let y = 26; y <= 37; y++) {
    const target = new Vec3(46, y, -123);
    const below = bot.blockAt(new Vec3(46, y - 1, -123));
    const cur = bot.blockAt(target);
    if (below && below.boundingBox === 'block' && (!cur || cur.name === 'lava' || cur.name === 'air')) {
      try {
        await bot.placeBlock(below, new Vec3(0, 1, 0));
        console.log(`Placed pillar block at y=${y}`);
      } catch (e) {
        console.log(`Error at y=${y}:`, e.message);
      }
    }
    // Also at y=32, place landing pad at (46, 32, -122)
    if (y === 32) {
      const p32 = bot.blockAt(new Vec3(46, 32, -123));
      if (p32 && p32.boundingBox === 'block') {
        try {
          await bot.placeBlock(p32, new Vec3(0, 0, 1));
          console.log('Placed landing pad at (46, 32, -122)!');
        } catch (e) {
          console.log('Landing pad place error:', e.message);
        }
      }
    }
  }

  // Swim up to y=37.5 alongside pillar
  console.log('Swimming up alongside pillar to y=38...');
  await bot.lookAt(new Vec3(46.0, 38.0, -123.0), true);
  bot.setControlState('jump', true);
  bot.setControlState('forward', true);
  const swimStart = Date.now();
  while (bot.entity.position.y < 37.5 && Date.now() - swimStart < 6000) {
    await sleep(100);
  }
  bot.clearControlStates();

  console.log(`Reached top: ${lib.fmt(bot.entity.position)}`);

  // Step onto top block (46, 38, -123)
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(46, 38, -123));
  } catch (e) {
    bot.setControlState('forward', true);
    await sleep(400);
    bot.clearControlStates();
  }

  // Step off onto landing pad at (46, 32, -122)
  console.log('Stepping off top onto landing pad at (46, 32, -122)...');
  bot.chat('alpha: Resetting to 20/20 HP via landing pad fall! Joining team at Overworld base!');
  await bot.lookAt(new Vec3(46.5, 32.0, -122.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.clearControlStates();
}

// Wait for respawn in Overworld
console.log('Waiting for respawn cycle...');
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 12000) {
  await sleep(250);
}

console.log(`Current state: dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}`);
