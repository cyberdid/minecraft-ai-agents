// programs/866-full-ascend-and-fall-reset.js
console.log('=== Program 866: Full Ascend & Fall Reset ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.chat('alpha: Swimming full 23m up to pre-mined notch at (34.5, 32.2, -48), stepping onto soul sand, and fall resetting!');

// 1. Swim UP and steer to (34.0, 32.5, -48.0) with a 45-second swim loop
console.log('Swimming up from y=9 to y=32.2 in open lava column...');
bot.setControlState('forward', true);
bot.setControlState('jump', true);

const swimStart = Date.now();
while (bot.entity.position.y < 32.0 && Date.now() - swimStart < 45000) {
  await bot.lookAt(new Vec3(34.0, Math.min(33.0, bot.entity.position.y + 3.0), -48.0), true);
  await sleep(150);

  if ((Date.now() - swimStart) % 3000 < 200) {
    console.log(`Ascending: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}, x=${bot.entity.position.x.toFixed(2)}`);
  }
}
bot.clearControlStates();
console.log(`At notch entrance: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);

// 2. Step East into the cleared notch onto solid soul sand at (35.5, 32.5, -48.0)
console.log('Stepping East into solid soul sand notch at x=35.5...');
await bot.lookAt(new Vec3(36.0, 32.5, -48.0), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);

const walkStart = Date.now();
while (Date.now() - walkStart < 4000) {
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

// 3. Equip cobblestone and pillar up 6 blocks on solid ground
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (!cobble) throw new Error('No cobblestone!');
await bot.equip(cobble, 'hand');

console.log('Pillaring up 6 blocks of cobblestone on solid ground...');
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

// 4. Step off pillar onto solid ground for fall reset!
if (peakY - startY >= 3.5) {
  console.log('Stepping off pillar onto solid ground for fall reset...');
  bot.chat('alpha: Fall reset onto mainland! Respawning at Overworld Base Bed!');
  await bot.look(bot.entity.yaw, 0, true);
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
