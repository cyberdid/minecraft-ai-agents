// programs/832-swim-onto-platform-and-reset.js
console.log('=== Program 832: Swim Onto Platform & Reset ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (!cobble) {
  console.log('No cobble in inventory!');
} else {
  await bot.equip(cobble, 'hand');

  // 1. Hold jump and move to (46.0, 33.0, -123.0) until solidly standing on top of platform
  console.log('Swimming onto solid platform at (46, 33, -123)...');
  await bot.lookAt(new Vec3(46.0, 33.0, -123.0), true);
  bot.setControlState('jump', true);
  bot.setControlState('forward', true);

  const swimStart = Date.now();
  while ((bot.entity.position.y < 32.9 || !bot.entity.onGround) && Date.now() - swimStart < 9000) {
    if (bot.entity.position.y >= 32.8) {
      // Guide bot towards center of platform
      await bot.lookAt(new Vec3(46.0, 33.0, -123.0), true);
    }
    await sleep(100);
  }
  bot.clearControlStates();

  console.log(`Standing at pos: ${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}, onGround=${bot.entity.onGround}`);
  console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

  // 2. Look straight down and pillar up 5 blocks in air
  console.log('Pillaring up 5 blocks in air...');
  const startY = bot.entity.position.y;
  await bot.look(bot.entity.yaw, -Math.PI / 2, true);

  for (let step = 0; step < 6 && bot.health > 0; step++) {
    const curBelow = bot.blockAt(bot.entity.position.offset(0, -0.2, 0));
    bot.setControlState('jump', true);
    await sleep(220);
    if (curBelow && curBelow.boundingBox === 'block') {
      try {
        await bot.placeBlock(curBelow, new Vec3(0, 1, 0));
        console.log(`Placed tower block ${step + 1}`);
      } catch (e) {
        console.log(`Tower step ${step + 1} place error:`, e.message);
      }
    }
    bot.setControlState('jump', false);
    await sleep(250);
  }

  const peakY = bot.entity.position.y;
  console.log(`Peak Y = ${peakY.toFixed(2)}, climbed: ${(peakY - startY).toFixed(2)}`);

  // 3. Step off onto the solid landing pad at y=32!
  if (peakY - startY >= 3.5) {
    console.log('Stepping off pillar onto solid cobblestone landing platform...');
    bot.chat('alpha: Fall reset onto solid cobblestone platform! Respawning at Overworld Base Bed!');
    await bot.lookAt(new Vec3(47.0, 32.0, -123.0), true);
    bot.setControlState('forward', true);
    await sleep(600);
    bot.clearControlStates();
  }
}

// 4. Wait for respawn in Overworld
console.log('Waiting for respawn cycle...');
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 12000) {
  await sleep(250);
}

console.log(`Final state: dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}`);
