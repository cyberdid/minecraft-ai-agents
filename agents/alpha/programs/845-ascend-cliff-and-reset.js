// programs/845-ascend-cliff-and-reset.js
console.log('=== Program 845: Ascend Cliff to y=34 & Fall Reset ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

bot.chat('alpha: Ascending vertical lava cliff to dry shore at y=34 for clean Overworld reset!');

// 1. Swim straight UP until y >= 34.0 (emerge onto gravel top at z=-36)
console.log('Holding jump to ascend from y=5 to y=34...');
await bot.look(0, 0, true); // Face South
bot.setControlState('jump', true);

const ascendStart = Date.now();
while (bot.entity.position.y < 34.0 && Date.now() - ascendStart < 50000) {
  // Steer slightly away from cliff wall so bot doesn't get caught on small ledges
  await bot.look(0, 0, true);
  await sleep(200);

  if ((Date.now() - ascendStart) % 5000 < 250) {
    console.log(`Ascending: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);
  }
}
bot.clearControlStates();
console.log(`Reached top: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);

// 2. Step forward onto solid gravel at (32.0, 34.0, -36.0)
console.log('Stepping onto solid gravel ground at z=-36...');
await bot.look(0, 0, true); // South (+Z)
bot.setControlState('forward', true);
bot.setControlState('jump', true);

const stepStart = Date.now();
while (!bot.entity.onGround && Date.now() - stepStart < 5000) {
  await sleep(150);
}
bot.clearControlStates();

console.log(`Standing on land: pos=${lib.fmt(bot.entity.position)}, onGround=${bot.entity.onGround}`);
console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

// 3. Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (cobble) await bot.equip(cobble, 'hand');

// 4. Pillar up 5 blocks on solid land
console.log('Pillaring up 5 blocks on solid gravel...');
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
      console.log(`Tower place error:`, e.message);
    }
  }
  bot.setControlState('jump', false);
  await sleep(250);
}

const peakY = bot.entity.position.y;
console.log(`Peak Y = ${peakY.toFixed(2)}, climbed: ${(peakY - startY).toFixed(2)}`);

// 5. Step off pillar onto solid ground!
if (peakY - startY >= 3.5) {
  console.log('Stepping off pillar to trigger fall damage reset...');
  bot.chat('alpha: Fall reset onto mainland! Respawning at Overworld Base Bed!');
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
