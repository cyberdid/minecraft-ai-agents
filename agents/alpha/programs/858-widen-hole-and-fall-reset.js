// programs/858-widen-hole-and-fall-reset.js
console.log('=== Program 858: Widen Breach & Fall Reset ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.chat('alpha: Swimming up to y=30, clearing 2x2 breach, popping out to soul sand surface, and fall resetting!');

// 1. Swim UP to y=30.2
console.log('Swimming straight up in lava to y=30.2...');
bot.setControlState('jump', true);

const swimStart = Date.now();
while (bot.entity.position.y < 30.0 && Date.now() - swimStart < 20000) {
  await bot.lookAt(new Vec3(38.0, 31.0, -48.5), true);
  await sleep(150);

  if ((Date.now() - swimStart) % 2500 < 150) {
    console.log(`Ascending: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);
  }
}
bot.clearControlStates();
console.log(`At ceiling: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);

// 2. Equip iron pickaxe
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// 3. Mine out all soul sand blocks in the 2x2 column at y=32 and y=33
const targets = [
  new Vec3(38, 32, -49),
  new Vec3(37, 32, -48),
  new Vec3(37, 32, -49),
  new Vec3(38, 33, -49),
  new Vec3(37, 33, -48)
];

for (const pos of targets) {
  const b = bot.blockAt(pos);
  if (b && b.name !== 'air' && b.name !== 'lava') {
    try {
      console.log(`Mining ${b.name} at ${lib.fmt(pos)}...`);
      await bot.dig(b, true);
      console.log(`Mined ${lib.fmt(pos)} successfully!`);
    } catch (e) {
      console.log(`Mining error at ${lib.fmt(pos)}:`, e.message);
    }
  }
}

// 4. Swim UP through wide 2x2 hole into open air (y=33.5)
console.log('Rising through wide 2x2 opening into air...');
bot.setControlState('jump', true);
const emergeStart = Date.now();
while (bot.entity.position.y < 33.0 && Date.now() - emergeStart < 8000) {
  await bot.lookAt(new Vec3(38.0, 35.0, -48.5), true);
  await sleep(100);
}
bot.clearControlStates();
console.log(`Emerged into air! pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);

// 5. Step East onto solid soul sand at x=39.5
console.log('Stepping East onto solid soul sand surface at x=39.5...');
const landStart = Date.now();
while (Date.now() - landStart < 6000) {
  await bot.lookAt(new Vec3(40.0, 33.5, -48.5), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(150);

  const under = bot.blockAt(bot.entity.position.offset(0, -0.5, 0));
  if (under && under.boundingBox === 'block' && under.name !== 'lava') {
    console.log(`Standing on solid block: ${under.name} at ${lib.fmt(bot.entity.position)}`);
    break;
  }
}
bot.clearControlStates();

console.log(`Standing pos: ${lib.fmt(bot.entity.position)}, onGround: ${bot.entity.onGround}`);
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
        console.log(`Placed tower step ${step + 1} at y=${bot.entity.position.y.toFixed(1)}`);
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
