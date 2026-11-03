// programs/831-platform-fall-reset.js
console.log('=== Program 831: Platform Fall Reset ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 1. Swim up to y=33
console.log('Swimming up to top of pillar (y=33)...');
await bot.lookAt(new Vec3(46.5, 33.0, -123.0), true);
bot.setControlState('jump', true);
bot.setControlState('forward', true);

const swimStart = Date.now();
while (bot.entity.position.y < 32.5 && Date.now() - swimStart < 9000) {
  await sleep(150);
}
bot.clearControlStates();

console.log(`Surface reached at pos: ${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);

// Move onto (46.5, 33.0, -123.0)
try {
  await bot.pathfinder.goto(new goals.GoalBlock(46, 33, -123));
} catch (e) {
  await bot.lookAt(new Vec3(46.5, 33.0, -123.0), true);
  bot.setControlState('forward', true);
  await sleep(500);
  bot.clearControlStates();
}

console.log('Now at pillar top:', lib.fmt(bot.entity.position));

// 2. Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (cobble) await bot.equip(cobble, 'hand');

// 3. Place adjacent landing blocks at y=32 around (46, 32, -123)
const pillarTop = bot.blockAt(new Vec3(46, 32, -123));
if (pillarTop) {
  // Place East (+X) at (47, 32, -123)
  try { await bot.placeBlock(pillarTop, new Vec3(1, 0, 0)); console.log('Placed pad at (47, 32, -123)'); } catch (e) {}
  // Place South (+Z) at (46, 32, -122)
  try { await bot.placeBlock(pillarTop, new Vec3(0, 0, 1)); console.log('Placed pad at (46, 32, -122)'); } catch (e) {}
  // Place North (-Z) at (46, 32, -124)
  try { await bot.placeBlock(pillarTop, new Vec3(0, 0, -1)); console.log('Placed pad at (46, 32, -124)'); } catch (e) {}
  // Place West (-X) at (45, 32, -123)
  try { await bot.placeBlock(pillarTop, new Vec3(-1, 0, 0)); console.log('Placed pad at (45, 32, -123)'); } catch (e) {}
}

// 4. Pillar up 5 blocks in air
console.log('Pillaring up 5 blocks in air...');
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

// 5. Step off onto the wide cobblestone landing platform at y=32!
if (peakY - startY >= 3.5) {
  console.log('Stepping off pillar onto solid cobblestone landing platform...');
  bot.chat('alpha: Fall reset onto solid cobblestone platform! Respawning at Overworld Base Bed!');
  await bot.lookAt(new Vec3(46.5, 32.0, -122.0), true);
  bot.setControlState('forward', true);
  await sleep(800);
  bot.clearControlStates();
}

// 6. Wait for respawn cycle
console.log('Waiting for respawn in Overworld...');
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 12000) {
  await sleep(250);
}

console.log(`Final state: dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}`);
