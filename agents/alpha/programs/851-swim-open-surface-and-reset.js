// programs/851-swim-open-surface-and-reset.js
console.log('=== Program 851: Swim Open Lake Surface & Overworld Reset ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.chat('alpha: Swimming up to open lava lake at (32, 32, -48), stepping onto soul sand shore, and fall resetting to Overworld base!');

// 1. Swim diagonally up and northwest towards (32.0, 32.5, -48.0)
console.log('Swimming towards open lake surface at (32.0, 32.5, -48.0)...');
bot.setControlState('jump', true);
bot.setControlState('forward', true);

const swimStart = Date.now();
while (bot.entity.position.y < 31.4 && Date.now() - swimStart < 55000) {
  const cur = bot.entity.position;
  // Look towards target in the open lava lake
  await bot.lookAt(new Vec3(32.0, Math.min(32.5, cur.y + 4.0), -48.0), true);
  await sleep(150);

  if ((Date.now() - swimStart) % 5000 < 200) {
    console.log(`Ascending: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);
  }
}
bot.clearControlStates();
console.log(`Surfaced! Pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);

// 2. Step East onto the solid soul sand shore at (38.0, 33.0, -48.0)
console.log('Stepping East onto solid soul sand shore...');
const shoreStart = Date.now();
while (!bot.entity.onGround && Date.now() - shoreStart < 12000) {
  await bot.lookAt(new Vec3(38.0, 33.5, -48.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(200);

  const under = bot.blockAt(bot.entity.position.offset(0, -0.5, 0));
  if (under && under.boundingBox === 'block') {
    console.log(`Found solid block under feet: ${under.name} at pos=${lib.fmt(bot.entity.position)}`);
    break;
  }
}
bot.clearControlStates();

console.log(`Standing on shore: pos=${lib.fmt(bot.entity.position)}, onGround=${bot.entity.onGround}`);
console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

// 3. Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (!cobble) {
  console.log('No cobblestone in inventory!');
} else {
  await bot.equip(cobble, 'hand');
  
  // 4. Pillar up 5 blocks on solid land
  console.log('Pillaring up 5 blocks on solid soul sand...');
  const startY = bot.entity.position.y;
  await bot.look(bot.entity.yaw, -Math.PI / 2, true);

  for (let step = 0; step < 6 && bot.health > 0; step++) {
    const below = bot.blockAt(bot.entity.position.offset(0, -0.2, 0));
    bot.setControlState('jump', true);
    await sleep(220);
    if (below && below.boundingBox === 'block') {
      try {
        await bot.placeBlock(below, new Vec3(0, 1, 0));
        console.log(`Placed tower step ${step + 1} at y=${bot.entity.position.y.toFixed(1)}`);
      } catch (e) {
        console.log(`Tower step ${step + 1} place error:`, e.message);
      }
    }
    bot.setControlState('jump', false);
    await sleep(250);
  }

  const peakY = bot.entity.position.y;
  console.log(`Peak Y = ${peakY.toFixed(2)}, climbed: ${(peakY - startY).toFixed(2)}`);

  // 5. Step off pillar onto solid ground to trigger fall reset!
  if (peakY - startY >= 3.5) {
    console.log('Stepping off pillar onto solid ground for fall reset...');
    bot.chat('alpha: Fall reset onto mainland! Respawning at Overworld Base Bed!');
    await bot.look(0, 0, true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.clearControlStates();
  }
}

// 6. Wait for Overworld respawn
console.log('Waiting for respawn in Overworld...');
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 15000) {
  await sleep(250);
}

console.log(`Final state: dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}`);
