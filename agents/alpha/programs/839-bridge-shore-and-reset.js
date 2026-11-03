// programs/839-bridge-shore-and-reset.js
console.log('=== Program 839: Bridge to Shore & Fall Reset ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (!cobble) {
  console.log('No cobblestone!');
} else {
  await bot.equip(cobble, 'hand');

  // 1. Swim up to surface (y=31.4) and move near x=35.0, z=-66.0
  bot.setControlState('jump', true);
  await bot.lookAt(new Vec3(35.5, 32.0, -66.0), true);
  bot.setControlState('forward', true);

  const swimStart = Date.now();
  while (bot.entity.position.y < 31.0 && Date.now() - swimStart < 10000) {
    await sleep(100);
  }
  bot.clearControlStates();
  console.log(`Surface reached: ${lib.fmt(bot.entity.position)}`);

  // 2. Place cobblestone at (35, 32, -66) against soul sand at (36, 32, -66)
  const shoreBlock = bot.blockAt(new Vec3(36, 32, -66));
  console.log('Shore block at (36, 32, -66):', shoreBlock?.name);

  if (shoreBlock && shoreBlock.boundingBox === 'block') {
    try {
      await bot.placeBlock(shoreBlock, new Vec3(-1, 0, 0));
      console.log('Placed bridge block at (35, 32, -66)!');
    } catch (e) {
      console.log('Bridge place error:', e.message);
    }
  }

  // 3. Jump onto the placed solid block at (35, 33, -66) or soul sand at (36, 33, -66)
  console.log('Stepping onto solid bridge/shore...');
  await bot.lookAt(new Vec3(36.0, 33.0, -66.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(1500);
  bot.clearControlStates();

  console.log(`Standing pos: ${lib.fmt(bot.entity.position)}, onGround: ${bot.entity.onGround}`);
  console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

  // 4. Pillar up 5 blocks with cobblestone on solid land
  console.log('Pillaring up 5 blocks on solid land...');
  const startY = bot.entity.position.y;
  await bot.look(bot.entity.yaw, -Math.PI / 2, true);

  for (let step = 0; step < 6 && bot.health > 0; step++) {
    const below = bot.blockAt(bot.entity.position.offset(0, -0.2, 0));
    bot.setControlState('jump', true);
    await sleep(220);
    if (below && below.boundingBox === 'block') {
      try {
        await bot.placeBlock(below, new Vec3(0, 1, 0));
        console.log(`Placed tower step ${step + 1}`);
      } catch (e) {}
    }
    bot.setControlState('jump', false);
    await sleep(250);
  }

  const peakY = bot.entity.position.y;
  console.log(`Peak Y = ${peakY.toFixed(2)}, climbed: ${(peakY - startY).toFixed(2)}`);

  // 5. Step off onto solid soul sand / cobblestone shore!
  if (peakY - startY >= 3.5) {
    console.log('Stepping off pillar to trigger clean 20/20 HP reset...');
    bot.chat('alpha: Fall reset onto solid ground! Respawning at Overworld Base Bed!');
    await bot.lookAt(new Vec3(36.0, 32.0, -66.0), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.clearControlStates();
  }
}

// 6. Wait for Overworld respawn
console.log('Waiting for respawn in Overworld...');
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 12000) {
  await sleep(250);
}

console.log(`Final state: dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}`);
