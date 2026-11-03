// programs/838-shore-step-and-reset.js
console.log('=== Program 838: Shore Step & Fall Reset ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 1. Ensure at x <= 33 in open lava
if (bot.entity.position.x > 33.0) {
  console.log('Moving West to x=32.5...');
  await bot.look(Math.PI / 2, 0, true);
  bot.setControlState('forward', true);
  const wStart = Date.now();
  while (bot.entity.position.x > 33.0 && Date.now() - wStart < 8000) {
    await sleep(100);
  }
  bot.clearControlStates();
}
console.log('At West position:', lib.fmt(bot.entity.position));

// 2. Swim straight up until y >= 33.3 (above top of soul sand at y=32)
console.log('Swimming up to y=33.5...');
bot.setControlState('jump', true);
const uStart = Date.now();
while (bot.entity.position.y < 33.3 && Date.now() - uStart < 18000) {
  await sleep(150);
}
console.log(`Height reached: y=${bot.entity.position.y.toFixed(2)}`);

// 3. Move East to x=37.0 while holding jump to step onto solid soul sand top
console.log('Stepping East onto solid soul sand plateau at x=37.0...');
await bot.look(-Math.PI / 2, 0, true); // East (+X)
bot.setControlState('forward', true);
bot.setControlState('jump', true);

const eStart = Date.now();
while (bot.entity.position.x < 36.8 && Date.now() - eStart < 8000) {
  await sleep(150);
}
bot.clearControlStates();

await sleep(500);
console.log(`Standing at: ${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}, onGround=${bot.entity.onGround}`);
console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

// 4. Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (cobble) await bot.equip(cobble, 'hand');

// 5. Pillar up 5 blocks on solid land
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
      console.log(`Placed tower step ${step + 1}`);
    } catch (e) {
      console.log(`Tower step ${step + 1} place error:`, e.message);
    }
  }
  bot.setControlState('jump', false);
  await sleep(250);
}

const peakY = bot.entity.position.y;
console.log(`Peak Y = ${peakY.toFixed(2)}, climbed: ${(peakY - startY).toFixed(2)}`);

// 6. Step off pillar onto solid ground!
if (peakY - startY >= 3.5) {
  console.log('Stepping off pillar onto solid soul sand to trigger fall damage reset...');
  bot.chat('alpha: Fall reset onto solid soul sand! Respawning at Overworld Base Bed!');
  await bot.look(-Math.PI / 2, 0, true);
  bot.setControlState('forward', true);
  await sleep(800);
  bot.clearControlStates();
}

// 7. Wait for respawn in Overworld
console.log('Waiting for respawn cycle...');
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 12000) {
  await sleep(250);
}

console.log(`Final state: dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}`);
