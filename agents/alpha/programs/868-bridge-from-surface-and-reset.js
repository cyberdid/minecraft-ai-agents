// programs/868-bridge-from-surface-and-reset.js
console.log('=== Program 868: Bridge from Surface & Fall Reset ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.chat('alpha: Swimming up at (32.0, y, -48.0) to surface, bridging cobblestone at y=32, pillaring 6 blocks, and fall resetting!');

// 1. Swim UP at (32.0, y, -48.0) until feet breach surface (y >= 31.4)
console.log('Swimming up to open surface at (32.0, 31.5, -48.0)...');
bot.setControlState('forward', true);
bot.setControlState('jump', true);

const swimStart = Date.now();
while (bot.entity.position.y < 31.3 && Date.now() - swimStart < 40000) {
  await bot.lookAt(new Vec3(32.0, Math.min(32.5, bot.entity.position.y + 3.0), -48.0), true);
  await sleep(120);

  if ((Date.now() - swimStart) % 3000 < 200) {
    console.log(`Ascending: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}, x=${bot.entity.position.x.toFixed(2)}`);
  }
}
bot.clearControlStates();
console.log(`At surface: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);

// 2. Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (!cobble) throw new Error('No cobblestone!');
await bot.equip(cobble, 'hand');

// 3. Bridge cobblestone at y=32 from x=36 backwards towards Alpha (x=35, 34, 33)
// Reference block 1: (36, 32, -48) [soul_sand]
for (const [refX, targetX] of [[36, 35], [35, 34], [34, 33]]) {
  const ref = bot.blockAt(new Vec3(refX, 32, -48));
  console.log(`Reference block at (${refX}, 32, -48): ${ref?.name}`);
  if (ref && ref.boundingBox === 'block') {
    try {
      console.log(`Placing cobblestone at (${targetX}, 32, -48) against (${refX}, 32, -48) [-X face]...`);
      await bot.placeBlock(ref, new Vec3(-1, 0, 0));
      console.log(`Placed cobblestone at (${targetX}, 32, -48)!`);
    } catch (e) {
      console.log(`Place error at (${targetX}, 32, -48):`, e.message);
    }
  }
}

// 4. Step onto the cobblestone bridge at (33.5, 33.0, -48.0)
console.log('Stepping onto cobblestone bridge...');
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await bot.lookAt(new Vec3(34.0, 33.5, -48.0), true);

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

console.log(`Standing pos: ${lib.fmt(bot.entity.position)}, onGround: ${bot.entity.onGround}`);
console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

// 5. Pillar up 6 blocks of cobblestone
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

// 6. Step East off pillar onto solid bridge/shore for fall reset!
if (peakY - startY >= 3.5) {
  console.log('Stepping off pillar onto solid ground for fall reset...');
  bot.chat('alpha: Fall reset onto mainland! Respawning at Overworld Base Bed!');
  await bot.look(-Math.PI / 2, 0, true); // East (+X)
  bot.setControlState('forward', true);
  await sleep(800);
  bot.clearControlStates();
}

// 7. Wait for Overworld respawn
console.log('Waiting for respawn in Overworld...');
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 12000) {
  await sleep(250);
}

console.log(`Final state: dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}`);
