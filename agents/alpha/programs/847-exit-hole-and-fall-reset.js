// programs/847-exit-hole-and-fall-reset.js
console.log('=== Program 847: Exit Breached Hole & Fall Reset ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

bot.chat('alpha: Ascending through breached ceiling hole to soul sand surface for clean Overworld reset!');

// 1. Swim straight UP through open hole (32.0, y, -42.0) until y >= 33.2
console.log('Holding jump to ascend through hole to y=33.5...');
await bot.lookAt(new Vec3(32.0, 35.0, -42.0), true);
bot.setControlState('jump', true);

const swimStart = Date.now();
while (bot.entity.position.y < 33.2 && Date.now() - swimStart < 35000) {
  await bot.lookAt(new Vec3(32.0, 35.0, -42.0), true);
  await sleep(150);

  if ((Date.now() - swimStart) % 5000 < 200) {
    console.log(`Ascending: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);
  }
}
console.log(`Reached hole top: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);

// 2. While holding jump, step East (+X) onto solid soul sand plateau at (33.5, 33.0, -42.0)
console.log('Stepping East onto solid soul sand plateau...');
await bot.look(-Math.PI / 2, 0, true); // East (+X)
bot.setControlState('forward', true);

const stepStart = Date.now();
while (!bot.entity.onGround && Date.now() - stepStart < 5000) {
  await sleep(100);
}
bot.clearControlStates();

console.log(`On dry land: pos=${lib.fmt(bot.entity.position)}, onGround=${bot.entity.onGround}`);
console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

// 3. Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (cobble) await bot.equip(cobble, 'hand');

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
      console.log(`Placed tower block ${step + 1}`);
    } catch (e) {
      console.log(`Tower place error:`, e.message);
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
  bot.chat('alpha: Fall reset onto solid soul sand! Respawning at Overworld Base Bed!');
  await bot.look(-Math.PI / 2, 0, true);
  bot.setControlState('forward', true);
  await sleep(800);
  bot.clearControlStates();
}

// 6. Wait for Overworld respawn
console.log('Waiting for respawn in Overworld...');
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 12000) {
  await sleep(250);
}

console.log(`Final state: dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}`);
