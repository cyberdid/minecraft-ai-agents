// programs/837-proper-timing-escape.js
console.log('=== Program 837: Proper Timing Shore Escape & Fall Reset ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 1. Move West until x <= 33.0 (fully clear of overhang)
console.log('Moving West to x=32.5 in lava...');
await bot.look(Math.PI / 2, 0, true); // Face West (-X)
bot.setControlState('forward', true);

const westStart = Date.now();
while (bot.entity.position.x > 33.0 && Date.now() - westStart < 12000) {
  await sleep(150);
}
bot.clearControlStates();
console.log(`Cleared overhang. Position: ${lib.fmt(bot.entity.position)}`);

// 2. Swim straight up into open air (y >= 32.5)
console.log('Swimming straight up into open air...');
bot.setControlState('jump', true);

const upStart = Date.now();
while (bot.entity.position.y < 32.5 && Date.now() - upStart < 18000) {
  await sleep(150);
}
bot.clearControlStates();
console.log(`Open air reached at: ${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);

// 3. Move East onto solid soul sand shore at x=36.0
console.log('Stepping East onto solid soul sand shore...');
await bot.look(-Math.PI / 2, 0, true); // Face East (+X)
bot.setControlState('forward', true);
bot.setControlState('jump', true);

const eastStart = Date.now();
while (bot.entity.position.x < 35.8 && Date.now() - eastStart < 6000) {
  await sleep(150);
}
bot.clearControlStates();

console.log(`On shore: pos=${lib.fmt(bot.entity.position)}, onGround=${bot.entity.onGround}`);
console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

// 4. Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (cobble) await bot.equip(cobble, 'hand');

// 5. Pillar up 5 blocks on solid land
console.log('Pillaring up 5 blocks on solid ground...');
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
  console.log('Stepping off pillar to trigger fall damage reset...');
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
