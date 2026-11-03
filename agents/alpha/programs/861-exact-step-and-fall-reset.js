// programs/861-exact-step-and-fall-reset.js
console.log('=== Program 861: Exact Step & Fall Reset ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.chat('alpha: Swimming up at (38, y, -49), stepping onto cobblestone platform at (38, 32, -48), pillaring 6 blocks, and fall resetting!');

// 1. Swim UP at (38.0, y, -49.0) until feet breach into air (y >= 31.8)
console.log('Swimming straight up at (38.0, y, -49.0) to y=31.8...');
bot.setControlState('jump', true);

const swimStart = Date.now();
while (bot.entity.position.y < 31.8 && Date.now() - swimStart < 20000) {
  await bot.lookAt(new Vec3(38.0, Math.min(33.0, bot.entity.position.y + 3.0), -49.0), true);
  await sleep(100);

  if ((Date.now() - swimStart) % 2500 < 150) {
    console.log(`Ascending: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);
  }
}
bot.clearControlStates();
console.log(`At surface: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);

// 2. Step South onto the cobblestone platform at (38.5, 33.0, -48.2)
console.log('Stepping South onto cobblestone platform at (38.5, 33.0, -48.2)...');
const stepTarget = new Vec3(38.5, 33.0, -48.2);
await bot.lookAt(stepTarget, true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);

const stepStart = Date.now();
while (Date.now() - stepStart < 3000) {
  await sleep(100);
  const under = bot.blockAt(bot.entity.position.offset(0, -0.5, 0));
  if (under && under.name === 'cobblestone') {
    console.log(`Firmly on cobblestone! pos=${lib.fmt(bot.entity.position)}`);
    break;
  }
}
bot.clearControlStates();

console.log(`Platform standing pos: ${lib.fmt(bot.entity.position)}, onGround: ${bot.entity.onGround}`);
console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

// 3. Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (!cobble) throw new Error('No cobblestone!');
await bot.equip(cobble, 'hand');

// 4. Pillar up 6 blocks of cobblestone
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

// 5. Step East off the pillar onto the solid soul sand surface at (39.5, 33.0, -48.0)
console.log('Stepping East off pillar onto solid ground for fall reset...');
bot.chat('alpha: Fall reset onto mainland! Respawning at Overworld Base Bed!');
await bot.look(-Math.PI / 2, 0, true); // East (+X)
bot.setControlState('forward', true);
await sleep(1000);
bot.clearControlStates();

// 6. Wait for Overworld respawn
console.log('Waiting for respawn in Overworld...');
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 12000) {
  await sleep(250);
}

console.log(`Final state: dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}`);
