// programs/862-staircase-land-and-reset.js
console.log('=== Program 862: Staircase Land & Fall Reset ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.chat('alpha: Swimming to y=31, placing bridge block at (38, 32, -49), stepping onto soul sand mainland, and fall resetting!');

// 1. Swim UP to y=31.0
console.log('Swimming straight up in lava to y=31.0...');
bot.setControlState('jump', true);

const swimStart = Date.now();
while (bot.entity.position.y < 31.0 && Date.now() - swimStart < 20000) {
  await bot.lookAt(new Vec3(38.2, 32.0, -48.5), true);
  await sleep(120);

  if ((Date.now() - swimStart) % 2500 < 150) {
    console.log(`Ascending: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);
  }
}
bot.clearControlStates();
console.log(`At y=31: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);

// 2. Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (!cobble) throw new Error('No cobblestone!');
await bot.equip(cobble, 'hand');

// 3. Place cobblestone at (38, 32, -49) against the North face of (38, 32, -48)
const cobbleRef = bot.blockAt(new Vec3(38, 32, -48));
console.log(`Reference block at (38, 32, -48): ${cobbleRef?.name}`);
if (cobbleRef && cobbleRef.boundingBox === 'block') {
  try {
    console.log('Placing cobblestone at (38, 32, -49) against (38, 32, -48) [-Z face]...');
    await bot.placeBlock(cobbleRef, new Vec3(0, 0, -1));
    console.log('Cobblestone placed at (38, 32, -49)!');
  } catch (e) {
    console.log('Place error (38, 32, -49):', e.message);
  }
}

// 4. Step up onto mainland at (39.5, 34.0, -48.5)
console.log('Stepping up onto solid soul sand mainland at x=39.5...');
const landTarget = new Vec3(39.5, 34.5, -48.5);
await bot.lookAt(landTarget, true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);

const stepStart = Date.now();
while (Date.now() - stepStart < 5000) {
  await sleep(100);
  const under = bot.blockAt(bot.entity.position.offset(0, -0.5, 0));
  if (under && under.boundingBox === 'block' && under.name !== 'lava') {
    console.log(`Firmly on solid ground: ${under.name} at pos=${lib.fmt(bot.entity.position)}`);
    break;
  }
}
bot.clearControlStates();

console.log(`Standing pos: ${lib.fmt(bot.entity.position)}, onGround: ${bot.entity.onGround}`);
console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

// 5. Pillar up 6 blocks of cobblestone on solid mainland
console.log('Pillaring up 6 blocks of cobblestone...');
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

// 6. Step East off pillar onto solid mainland for fall reset!
if (peakY - startY >= 3.5) {
  console.log('Stepping East off pillar onto solid ground for fall reset...');
  bot.chat('alpha: Fall reset onto mainland! Respawning at Overworld Base Bed!');
  await bot.look(-Math.PI / 2, 0, true); // East (+X)
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.clearControlStates();
}

// 7. Wait for Overworld respawn
console.log('Waiting for respawn in Overworld...');
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 12000) {
  await sleep(250);
}

console.log(`Final state: dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}`);
