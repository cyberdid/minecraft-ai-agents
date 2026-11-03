// programs/854-breach-surface-and-fall-reset.js
console.log('=== Program 854: Breach Surface & Fall Reset ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.chat('alpha: Swimming up 9m at (38, y, -48), mining soul sand roof at y=32..33, and triggering fall reset!');

// 1. Swim UP at (38.0, y, -48.0) to y=31.0 (just under soul sand ceiling)
console.log('Swimming straight up in lava to y=31.0...');
bot.setControlState('jump', true);

const swimStart = Date.now();
while (bot.entity.position.y < 31.0 && Date.now() - swimStart < 25000) {
  await bot.lookAt(new Vec3(38.0, 32.0, -48.0), true);
  await sleep(150);

  if ((Date.now() - swimStart) % 3000 < 200) {
    console.log(`Ascending: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);
  }
}
bot.clearControlStates();
console.log(`Under ceiling: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);

// 2. Equip iron pickaxe
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) {
  console.log('Equipping pickaxe:', pick.name);
  await bot.equip(pick, 'hand');
}

// 3. Dig soul sand ceiling at y=32 and y=33
for (const by of [32, 33]) {
  const b = bot.blockAt(new Vec3(38, by, -48));
  console.log(`Block at (38, ${by}, -48): ${b?.name}`);
  if (b && b.name !== 'air' && b.name !== 'lava') {
    try {
      console.log(`Mining ${b.name} at y=${by}...`);
      await bot.dig(b, true);
      console.log(`Mined y=${by} successfully!`);
    } catch (e) {
      console.log(`Mining error at y=${by}:`, e.message);
    }
  }
}

// 4. Jump up through the 2-block hole into open air (y=34)
console.log('Jumping up through hole into air...');
bot.setControlState('jump', true);
const jumpStart = Date.now();
while (bot.entity.position.y < 33.5 && Date.now() - jumpStart < 5000) {
  await sleep(100);
}
bot.clearControlStates();
console.log(`Breached into air! pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);

// 5. Step East (+X) onto solid soul sand surface at x=39..40
console.log('Stepping East onto solid soul sand surface...');
await bot.look(-Math.PI / 2, 0, true); // East
bot.setControlState('forward', true);
bot.setControlState('jump', true);

const stepStart = Date.now();
while (!bot.entity.onGround && Date.now() - stepStart < 5000) {
  await sleep(100);
  const under = bot.blockAt(bot.entity.position.offset(0, -0.5, 0));
  if (under && under.boundingBox === 'block') break;
}
bot.clearControlStates();

console.log(`Standing on solid shore: pos=${lib.fmt(bot.entity.position)}, onGround=${bot.entity.onGround}`);
console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

// 6. Equip cobblestone and pillar up 5 blocks on solid land
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (cobble) {
  await bot.equip(cobble, 'hand');
  console.log('Pillaring up 5 blocks on solid ground...');
  const startY = bot.entity.position.y;
  await bot.look(bot.entity.yaw, -Math.PI / 2, true);

  for (let step = 0; step < 6 && bot.health > 0; step++) {
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

  // 7. Step off pillar onto solid ground for fall reset!
  if (peakY - startY >= 3.5) {
    console.log('Stepping off pillar to trigger fall damage reset...');
    bot.chat('alpha: Fall reset onto mainland! Respawning at Overworld Base Bed!');
    await bot.look(0, 0, true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.clearControlStates();
  }
}

// 8. Wait for Overworld respawn
console.log('Waiting for respawn in Overworld...');
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 12000) {
  await sleep(250);
}

console.log(`Final state: dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}`);
