// programs/846-swim-breach-fall-reset.js
console.log('=== Program 846: Swim Up, Breach Soul Sand & Fall Reset ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

bot.chat('alpha: Swimming up to y=30, breaching soul sand roof to surface, and triggering fall reset!');

// 1. Swim straight UP at (32.4, y, -42.0) to y=29
console.log('Swimming straight up in open lava column from y=4 to y=29...');
await bot.lookAt(new Vec3(32.4, 30.0, -42.0), true);
bot.setControlState('jump', true);

const swimStart = Date.now();
while (bot.entity.position.y < 29.0 && Date.now() - swimStart < 45000) {
  await bot.lookAt(new Vec3(32.4, 30.0, -42.0), true);
  await sleep(200);

  if ((Date.now() - swimStart) % 5000 < 250) {
    console.log(`Ascending: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);
  }
}
bot.clearControlStates();
console.log(`Reached breach position: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);

// 2. Equip iron pickaxe and breach soul sand ceiling at (32, 31, -42) and (32, 32, -42)
console.log('Breaching soul sand ceiling with iron pickaxe...');
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

for (const by of [30, 31, 32, 33]) {
  const b = bot.blockAt(new Vec3(32, by, -42));
  if (b && b.name !== 'air' && b.name !== 'lava') {
    try {
      console.log(`Digging block at (32, ${by}, -42): ${b.name}...`);
      await bot.dig(b, true);
    } catch (e) {
      console.log(`Dig error at y=${by}:`, e.message);
    }
  }
}

// 3. Jump through the breach into open air at y=33
console.log('Jumping up through breach onto surface...');
bot.setControlState('jump', true);
const jumpStart = Date.now();
while (bot.entity.position.y < 33.0 && Date.now() - jumpStart < 6000) {
  await sleep(150);
}
bot.clearControlStates();

// Step onto solid soul sand neighbor
try {
  await bot.pathfinder.goto(new goals.GoalBlock(33, 33, -42));
} catch (e) {
  await bot.lookAt(new Vec3(33.0, 33.0, -42.0), true);
  bot.setControlState('forward', true);
  await sleep(800);
  bot.clearControlStates();
}

console.log(`Surface standing pos: ${lib.fmt(bot.entity.position)}, onGround: ${bot.entity.onGround}`);
console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

// 4. Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (cobble) await bot.equip(cobble, 'hand');

// 5. Pillar up 5 blocks on solid soul sand
console.log('Pillaring up 5 blocks on solid land...');
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
  console.log('Stepping off pillar to trigger fall damage reset...');
  bot.chat('alpha: Fall reset onto mainland! Respawning at Overworld Base Bed!');
  await bot.look(0, 0, true);
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
