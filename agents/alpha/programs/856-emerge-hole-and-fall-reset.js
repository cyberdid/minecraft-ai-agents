// programs/856-emerge-hole-and-fall-reset.js
console.log('=== Program 856: Emerge Through Open Hole & Fall Reset ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.chat('alpha: Swimming up through open hole at (38.5, y, -48.0) to soul sand surface and triggering fall reset!');

// 1. Swim UP directly through hole at (38.5, y, -48.0)
console.log('Steering directly into hole at (38.5, y, -48.0)...');
bot.setControlState('jump', true);
bot.setControlState('forward', true);

const swimStart = Date.now();
while (bot.entity.position.y < 33.2 && Date.now() - swimStart < 25000) {
  // Look directly at center of the hole above
  const target = new Vec3(38.5, Math.min(34.0, bot.entity.position.y + 3.0), -48.0);
  await bot.lookAt(target, true);
  await sleep(100);

  if ((Date.now() - swimStart) % 2500 < 150) {
    console.log(`Ascending: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);
  }
}
bot.clearControlStates();
console.log(`Surfaced! Pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);

// 2. Step East onto the solid soul sand at (39.5, 33.5, -48.0)
console.log('Stepping East onto solid soul sand surface...');
const stepStart = Date.now();
while (Date.now() - stepStart < 5000) {
  await bot.lookAt(new Vec3(39.5, 33.5, -48.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(150);

  const under = bot.blockAt(bot.entity.position.offset(0, -0.5, 0));
  if (under && under.boundingBox === 'block' && under.name !== 'lava') {
    console.log(`Standing on solid block: ${under.name} at ${lib.fmt(bot.entity.position)}`);
    break;
  }
}
bot.clearControlStates();

console.log(`Surface standing pos: ${lib.fmt(bot.entity.position)}, onGround: ${bot.entity.onGround}`);
console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

// 3. Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (!cobble) {
  console.log('No cobblestone!');
} else {
  await bot.equip(cobble, 'hand');

  // 4. Pillar up 5 blocks on solid land
  console.log('Pillaring up 5 blocks on solid soul sand...');
  const startY = bot.entity.position.y;
  await bot.look(bot.entity.yaw, -Math.PI / 2, true);

  for (let step = 0; step < 6 && bot.health > 0; step++) {
    const below = bot.blockAt(bot.entity.position.offset(0, -0.2, 0));
    bot.setControlState('jump', true);
    await sleep(220);
    if (below && below.boundingBox === 'block') {
      try {
        await bot.placeBlock(below, new Vec3(0, 1, 0));
        console.log(`Placed tower step ${step + 1} at y=${bot.entity.position.y.toFixed(1)}`);
      } catch (e) {
        console.log(`Tower step place error:`, e.message);
      }
    }
    bot.setControlState('jump', false);
    await sleep(250);
  }

  const peakY = bot.entity.position.y;
  console.log(`Peak Y = ${peakY.toFixed(2)}, climbed: ${(peakY - startY).toFixed(2)}`);

  // 5. Step off pillar onto solid ground!
  if (peakY - startY >= 3.5) {
    console.log('Stepping off pillar to trigger fall damage reset...');
    bot.chat('alpha: Fall reset onto mainland! Respawning at Overworld Base Bed!');
    await bot.look(0, 0, true);
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
