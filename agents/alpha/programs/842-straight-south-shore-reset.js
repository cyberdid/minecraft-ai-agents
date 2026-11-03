// programs/842-straight-south-shore-reset.js
console.log('=== Program 842: Straight South to Shore (Yaw 0) & Fall Reset ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

bot.chat('alpha: Swimming final 7m South to dry shore at z=-28 for clean Overworld reset!');

// 1. Look straight South (yaw = 0, pitch = 0) and swim forward + jump
await bot.look(0, 0, true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);

const swimStart = Date.now();
while (bot.entity.position.z < -26.0 && Date.now() - swimStart < 25000) {
  // Keep yaw locked South (+Z)
  await bot.look(0, 0, true);
  await sleep(150);
  if ((Date.now() - swimStart) % 3000 < 200) {
    console.log(`Pos: ${lib.fmt(bot.entity.position)}, onGround: ${bot.entity.onGround}`);
  }
}
bot.clearControlStates();
console.log(`Reached shore zone: ${lib.fmt(bot.entity.position)}, onGround: ${bot.entity.onGround}`);

// 2. Ensure firmly on solid ground (not lava)
await sleep(400);
const blockUnder = bot.blockAt(bot.entity.position.offset(0, -0.5, 0));
console.log('Block under feet:', blockUnder?.name);

// If still in lava, take 2 steps further South onto land
if (blockUnder?.name === 'lava' || !bot.entity.onGround) {
  await bot.look(0, 0, true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(2500);
  bot.clearControlStates();
}

console.log(`Final ground pos: ${lib.fmt(bot.entity.position)}, onGround: ${bot.entity.onGround}`);
console.log('Final block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

// 3. Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (cobble) await bot.equip(cobble, 'hand');

// 4. Pillar up 5 blocks on solid land
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
