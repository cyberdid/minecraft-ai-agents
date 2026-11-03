// programs/835-land-fall-reset.js
console.log('=== Program 835: Land Mass Fall Reset ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 1. Swim up to y=34 and step South onto solid gravel at (42.5, 34.0, -70.5)
console.log('Swimming up onto solid land mass at z=-70...');
await bot.lookAt(new Vec3(42.5, 34.0, -70.0), true);
bot.setControlState('jump', true);
bot.setControlState('forward', true);

const swimStart = Date.now();
while (bot.entity.position.y < 33.8 && Date.now() - swimStart < 8000) {
  await sleep(100);
}
await sleep(400);
bot.clearControlStates();

console.log(`Standing at: ${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}, onGround=${bot.entity.onGround}`);
console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

// 2. Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (cobble) await bot.equip(cobble, 'hand');

// 3. Pillar up 5 blocks on solid land
console.log('Pillaring up 5 blocks on solid gravel...');
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
    } catch (e) {
      console.log(`Step ${step + 1} place error:`, e.message);
    }
  }
  bot.setControlState('jump', false);
  await sleep(250);
}

const peakY = bot.entity.position.y;
console.log(`Peak Y = ${peakY.toFixed(2)}, climbed: ${(peakY - startY).toFixed(2)}`);

// 4. Step off pillar onto the solid gravel shore!
if (peakY - startY >= 3.5) {
  console.log('Stepping off pillar onto solid gravel shore to trigger fall damage reset...');
  bot.chat('alpha: Fall reset onto solid gravel! Respawning at Overworld Base Bed!');
  await bot.lookAt(new Vec3(42.5, 33.0, -69.0), true);
  bot.setControlState('forward', true);
  await sleep(800);
  bot.clearControlStates();
}

// 5. Wait for respawn in Overworld
console.log('Waiting for respawn cycle...');
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 12000) {
  await sleep(250);
}

console.log(`Final state: dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}`);
