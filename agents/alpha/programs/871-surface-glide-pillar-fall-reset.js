// programs/871-surface-glide-pillar-fall-reset.js
console.log('=== Program 871: Surface Glide Pillar Fall Reset ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.chat('alpha: Swimming up unobstructed channel at x=32 to surface (y=31.4), gliding East to soul sand at x=39, pillaring 6 blocks, and fall resetting!');

// 1. Swim UP at (32.0, y, -48.0) until reaching open surface (y >= 31.3)
console.log('Swimming UP in open channel at x=32.0, z=-48.0...');
bot.setControlState('forward', true);
bot.setControlState('jump', true);

const swimStart = Date.now();
while (bot.entity.position.y < 31.3 && Date.now() - swimStart < 35000) {
  const curY = bot.entity.position.y;
  await bot.lookAt(new Vec3(32.0, Math.min(32.5, curY + 3.0), -48.0), true);
  await sleep(120);

  if ((Date.now() - swimStart) % 3000 < 200) {
    console.log(`Ascending: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}, x=${bot.entity.position.x.toFixed(2)}`);
  }
}
bot.clearControlStates();
console.log(`At surface: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);

// 2. Glide East (+X) across the surface from x=32 to x=39.5 at y=31.5
console.log('Gliding East across surface to solid soul sand floor at x=39.5...');
await bot.look(-Math.PI / 2, 0, true); // East (+X)
bot.setControlState('forward', true);
bot.setControlState('jump', true);

const glideStart = Date.now();
while (bot.entity.position.x < 39.0 && Date.now() - glideStart < 8000) {
  await bot.look(-Math.PI / 2, 0, true);
  await sleep(100);

  const under = bot.blockAt(bot.entity.position.offset(0, -0.5, 0));
  if (under && under.boundingBox === 'block' && under.name !== 'lava') {
    console.log(`Solid ground reached: ${under.name} at pos=${lib.fmt(bot.entity.position)}`);
    break;
  }
}
bot.clearControlStates();

console.log(`Standing pos: ${lib.fmt(bot.entity.position)}, onGround: ${bot.entity.onGround}`);
console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

// 3. Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (!cobble) throw new Error('No cobblestone!');
await bot.equip(cobble, 'hand');

// 4. Pillar up 6 blocks of cobblestone on solid soul sand
console.log('Pillaring up 6 blocks of cobblestone on solid soul sand...');
const startY = bot.entity.position.y;
await bot.look(bot.entity.yaw, -Math.PI / 2, true);

for (let step = 0; step < 7 && bot.health > 0; step++) {
  const below = bot.blockAt(bot.entity.position.offset(0, -0.2, 0));
  bot.setControlState('jump', true);
  await sleep(220);
  if (below && below.boundingBox === 'block') {
    try {
      await bot.placeBlock(below, new Vec3(0, 1, 0));
      console.log(`Placed tower block ${step + 1} at y=${bot.entity.position.y.toFixed(1)}`);
    } catch (e) {
      console.log(`Tower place error:`, e.message);
    }
  }
  bot.setControlState('jump', false);
  await sleep(250);
}

const peakY = bot.entity.position.y;
console.log(`Peak Y = ${peakY.toFixed(2)}, climbed: ${(peakY - startY).toFixed(2)}`);

// 5. Step off pillar onto solid ground for fall reset!
if (peakY - startY >= 3.5) {
  console.log('Stepping off pillar onto solid ground for fall reset...');
  bot.chat('alpha: Fall reset onto mainland! Respawning at Overworld Base Bed!');
  await bot.look(bot.entity.yaw, 0, true);
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
