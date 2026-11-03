// programs/865-cut-shore-and-fall-reset.js
console.log('=== Program 865: Cut Shore & Fall Reset ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.chat('alpha: Swimming to surface at (32.5, 31.8, -48), mining shore notch with Haste III, stepping onto solid ground, and fall resetting!');

// 1. Swim UP and West to surface at (32.5, 31.8, -48.0)
console.log('Swimming to open lava surface at (32.5, 31.8, -48.0)...');
bot.setControlState('forward', true);
bot.setControlState('jump', true);

const swimStart = Date.now();
while ((bot.entity.position.y < 31.4 || bot.entity.position.x > 33.0) && Date.now() - swimStart < 20000) {
  await bot.lookAt(new Vec3(32.5, Math.min(32.5, bot.entity.position.y + 3.0), -48.0), true);
  await sleep(120);

  if ((Date.now() - swimStart) % 2500 < 150) {
    console.log(`Ascending: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}, x=${bot.entity.position.x.toFixed(2)}`);
  }
}
bot.clearControlStates();
console.log(`At surface: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);

// 2. Equip iron pickaxe
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// 3. Mine a 1x2 notch directly into the soul sand shore at x=33..35, y=32..33, z=-48
console.log('Mining 1x2 notch into soul sand shore...');
for (const x of [33, 34, 35]) {
  for (const y of [32, 33]) {
    const b = bot.blockAt(new Vec3(x, y, -48));
    if (b && b.boundingBox === 'block' && b.name !== 'lava') {
      try {
        console.log(`Mining ${b.name} at (${x}, ${y}, -48)...`);
        await bot.dig(b, true);
        console.log(`Mined (${x}, ${y}, -48)!`);
      } catch (e) {
        console.log(`Dig error at (${x}, ${y}, -48):`, e.message);
      }
    }
  }
}

// 4. Walk forward into the cut notch onto solid soul sand at (34.5, 32.5, -48.0)
console.log('Walking forward into the cleared notch...');
await bot.lookAt(new Vec3(35.0, 32.5, -48.0), true);
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

// 5. Equip cobblestone and pillar up 6 blocks
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (cobble) {
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

  // 6. Step off pillar onto solid ground for fall reset!
  if (peakY - startY >= 3.5) {
    console.log('Stepping off pillar onto solid ground for fall reset...');
    bot.chat('alpha: Fall reset onto mainland! Respawning at Overworld Base Bed!');
    await bot.look(bot.entity.yaw, 0, true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.clearControlStates();
  }
}

// 7. Wait for Overworld respawn
console.log('Waiting for respawn in Overworld...');
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 12000) {
  await sleep(250);
}

console.log(`Final state: dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}`);
