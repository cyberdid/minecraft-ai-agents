// programs/829-ascend-pillar-and-reset.js
console.log('=== Program 829: Ascend Pillar & Fall Reset ===');
console.log('Starting pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (!cobble) {
  console.log('No cobble in inventory!');
} else {
  await bot.equip(cobble, 'hand');

  // 1. Swim up to top of existing pillar at y=33
  console.log('Swimming up to top of pillar at (46, 33, -123)...');
  await bot.lookAt(new Vec3(46.0, 33.0, -123.0), true);
  bot.setControlState('jump', true);
  bot.setControlState('forward', true);

  const swimStart = Date.now();
  while (bot.entity.position.y < 32.8 && Date.now() - swimStart < 5000) {
    await sleep(100);
  }
  bot.clearControlStates();

  console.log(`Standing at pillar top: ${lib.fmt(bot.entity.position)}`);

  // 2. Place solid landing pad adjacent at (46, 32, -122)
  const pillarTop = bot.blockAt(new Vec3(46, 32, -123));
  if (pillarTop) {
    try {
      await bot.placeBlock(pillarTop, new Vec3(0, 0, 1));
      console.log('Placed solid landing pad at (46, 32, -122)!');
    } catch (e) {
      console.log('Landing pad error:', e.message);
    }
  }

  // 3. Pillar up 5 blocks in air
  console.log('Pillaring up 5 blocks in air...');
  const startY = bot.entity.position.y;
  await bot.look(bot.entity.yaw, -Math.PI / 2, true);

  for (let i = 0; i < 6; i++) {
    const curBelow = bot.blockAt(bot.entity.position.offset(0, -0.2, 0));
    bot.setControlState('jump', true);
    await sleep(220);
    if (curBelow && curBelow.boundingBox === 'block') {
      try {
        await bot.placeBlock(curBelow, new Vec3(0, 1, 0));
        console.log(`Placed tower block ${i + 1}`);
      } catch (e) {}
    }
    bot.setControlState('jump', false);
    await sleep(220);
  }

  console.log(`Peak Y = ${bot.entity.position.y.toFixed(2)}, climbed: ${(bot.entity.position.y - startY).toFixed(2)}`);

  // 4. Step off onto the solid landing pad at (46, 32, -122)
  console.log('Stepping off onto solid landing pad...');
  bot.chat('alpha: Fall reset onto solid cobblestone landing pad! Respawning at Overworld Base Bed!');
  await bot.lookAt(new Vec3(46.5, 32.0, -122.0), true);
  bot.setControlState('forward', true);
  await sleep(800);
  bot.clearControlStates();
}

// 5. Wait for Overworld respawn
console.log('Waiting for respawn in Overworld...');
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 10000) {
  await sleep(250);
}

console.log(`Final state: dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}`);
