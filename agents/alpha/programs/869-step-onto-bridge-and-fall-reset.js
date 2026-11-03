// programs/869-step-onto-bridge-and-fall-reset.js
console.log('=== Program 869: Step onto Bridge & Fall Reset ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.chat('alpha: Swimming up directly onto verified cobblestone bridge at (34.0, 33.0, -48.0), pillaring 6 blocks, and fall resetting!');

// 1. Swim UP and East directly onto bridge top at (34.0, 33.5, -48.0)
console.log('Swimming directly to bridge top at (34.0, 33.5, -48.0)...');
bot.setControlState('forward', true);
bot.setControlState('jump', true);

const swimStart = Date.now();
while ((bot.entity.position.y < 32.8 || bot.entity.position.x < 33.2) && Date.now() - swimStart < 35000) {
  const curY = bot.entity.position.y;
  await bot.lookAt(new Vec3(34.0, Math.min(34.0, curY + 3.0), -48.0), true);
  await sleep(120);

  if ((Date.now() - swimStart) % 3000 < 200) {
    console.log(`Ascending: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}, x=${bot.entity.position.x.toFixed(2)}`);
  }
}
bot.clearControlStates();
console.log(`At bridge: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}, onGround=${bot.entity.onGround}`);

// Ensure firmly on ground at x=34.0, z=-48.0
const landStart = Date.now();
while (!bot.entity.onGround && Date.now() - landStart < 4000) {
  await bot.lookAt(new Vec3(35.0, 33.0, -48.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(100);

  const under = bot.blockAt(bot.entity.position.offset(0, -0.5, 0));
  if (under && under.boundingBox === 'block' && under.name !== 'lava') {
    console.log(`Solid footing confirmed: ${under.name} at pos=${lib.fmt(bot.entity.position)}`);
    break;
  }
}
bot.clearControlStates();

console.log(`Standing on bridge: pos=${lib.fmt(bot.entity.position)}, onGround=${bot.entity.onGround}`);
console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

// 2. Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (!cobble) throw new Error('No cobblestone!');
await bot.equip(cobble, 'hand');

// 3. Pillar up 6 blocks of cobblestone
console.log('Pillaring up 6 blocks of cobblestone on solid bridge...');
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

// 4. Step East (+X) off pillar onto solid bridge / shore (towards x=36)
if (peakY - startY >= 3.5) {
  console.log('Stepping East off pillar onto solid bridge for fall reset...');
  bot.chat('alpha: Fall reset onto solid bridge! Respawning at Overworld Base Bed!');
  await bot.look(-Math.PI / 2, 0, true); // East (+X)
  bot.setControlState('forward', true);
  await sleep(800);
  bot.clearControlStates();
}

// 5. Wait for Overworld respawn
console.log('Waiting for respawn in Overworld...');
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 12000) {
  await sleep(250);
}

console.log(`Final state: dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}`);
