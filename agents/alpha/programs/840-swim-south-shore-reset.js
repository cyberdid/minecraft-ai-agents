// programs/840-swim-south-shore-reset.js
console.log('=== Program 840: Swim South to Shoreline (z=-30) & Fall Reset ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

bot.chat('alpha: Swimming South along x=30 to mainland shore at z=-30 for clean Overworld reset!');

// 1. Swim South along x=30.0 towards (30.0, 35.0, -30.0)
const target = new Vec3(30.0, 35.0, -30.0);
await bot.lookAt(target, true);

bot.setControlState('forward', true);
bot.setControlState('jump', true);

const swimStart = Date.now();
while (bot.entity.position.z < -31.0 && Date.now() - swimStart < 35000) {
  // Steer towards x=30.0
  await bot.lookAt(new Vec3(30.0, Math.max(bot.entity.position.y, 32.0), -28.0), true);
  await sleep(150);
  if ((Date.now() - swimStart) % 5000 < 200) {
    console.log(`Swimming South: at ${lib.fmt(bot.entity.position)}, dist to shore: ${(-30.0 - bot.entity.position.z).toFixed(1)}m`);
  }
}
bot.clearControlStates();
console.log(`Reached shoreline zone: ${lib.fmt(bot.entity.position)}`);

// 2. Ascend onto the solid soul soil shore at (30.0, 35.0, -30.0)
await bot.lookAt(new Vec3(30.0, 35.0, -28.0), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);

const landStart = Date.now();
while (!bot.entity.onGround && Date.now() - landStart < 6000) {
  await sleep(150);
}
bot.clearControlStates();

console.log(`On land: pos=${lib.fmt(bot.entity.position)}, onGround=${bot.entity.onGround}`);
console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

// 3. Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (cobble) await bot.equip(cobble, 'hand');

// 4. Pillar up 5 blocks on solid mainland
console.log('Pillaring up 5 blocks on solid soul soil...');
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
      console.log(`Tower place error:`, e.message);
    }
  }
  bot.setControlState('jump', false);
  await sleep(250);
}

const peakY = bot.entity.position.y;
console.log(`Peak Y = ${peakY.toFixed(2)}, climbed: ${(peakY - startY).toFixed(2)}`);

// 5. Step off pillar onto solid mainland soul soil!
if (peakY - startY >= 3.5) {
  console.log('Stepping off pillar to trigger fall damage reset...');
  bot.chat('alpha: Fall reset onto mainland soul soil! Respawning at Overworld Base Bed!');
  await bot.look(0, 0, true);
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
