// programs/870-mine-notch-pillar-fall-reset.js
console.log('=== Program 870: Mine Notch Pillar Fall Reset ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.chat('alpha: Swimming to y=31, mining soul sand notch at (39, 32..33, -48), pillaring 6 blocks on solid soul sand, and fall resetting!');

// 1. Swim UP and East towards (37.5, 31.5, -48.0)
console.log('Swimming UP to y=31.0...');
bot.setControlState('forward', true);
bot.setControlState('jump', true);

const swimStart = Date.now();
while (bot.entity.position.y < 30.8 && Date.now() - swimStart < 30000) {
  const curY = bot.entity.position.y;
  await bot.lookAt(new Vec3(37.5, Math.min(32.0, curY + 3.0), -48.0), true);
  await sleep(120);

  if ((Date.now() - swimStart) % 3000 < 200) {
    console.log(`Ascending: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}, x=${bot.entity.position.x.toFixed(2)}`);
  }
}
bot.clearControlStates();
console.log(`Near target notch: pos=${lib.fmt(bot.entity.position)}, y=${bot.entity.position.y.toFixed(2)}`);

// 2. Equip iron pickaxe
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// 3. Mine out (38, 32, -48), (39, 33, -48), and (39, 32, -48)
const targets = [
  new Vec3(38, 32, -48),
  new Vec3(39, 33, -48),
  new Vec3(39, 32, -48)
];

for (const p of targets) {
  const b = bot.blockAt(p);
  console.log(`Block at ${lib.fmt(p)}: ${b?.name}`);
  if (b && b.boundingBox === 'block' && b.name !== 'lava') {
    try {
      console.log(`Mining ${b.name} at ${lib.fmt(p)}...`);
      await bot.dig(b, true);
      console.log(`Mined ${lib.fmt(p)} successfully!`);
    } catch (e) {
      console.log(`Mining error at ${lib.fmt(p)}:`, e.message);
    }
  }
}

// 4. Step East into the cleared notch at (39.5, 32.0, -48.0)
console.log('Stepping East onto solid soul sand floor at (39.5, 32.0, -48.0)...');
await bot.lookAt(new Vec3(40.0, 32.5, -48.0), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);

const stepStart = Date.now();
while (Date.now() - stepStart < 4000) {
  await sleep(100);
  const under = bot.blockAt(bot.entity.position.offset(0, -0.5, 0));
  if (under && under.boundingBox === 'block' && under.name !== 'lava') {
    console.log(`Solid soul sand footing confirmed: ${under.name} at pos=${lib.fmt(bot.entity.position)}`);
    break;
  }
}
bot.clearControlStates();

console.log(`Standing pos: ${lib.fmt(bot.entity.position)}, onGround: ${bot.entity.onGround}`);
console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

// 5. Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (!cobble) throw new Error('No cobblestone!');
await bot.equip(cobble, 'hand');

// 6. Pillar up 6 blocks of cobblestone on solid soul sand
console.log('Pillaring up 6 blocks of cobblestone on solid soul sand...');
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

// 7. Step West (-X) off the pillar onto the solid soul sand floor at y=32!
if (peakY - startY >= 3.5) {
  console.log('Stepping West off pillar onto solid ground for fall reset...');
  bot.chat('alpha: Fall reset onto mainland! Respawning at Overworld Base Bed!');
  await bot.look(Math.PI / 2, 0, true); // West (-X)
  bot.setControlState('forward', true);
  await sleep(800);
  bot.clearControlStates();
}

// 8. Wait for Overworld respawn
console.log('Waiting for respawn in Overworld...');
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 12000) {
  await sleep(250);
}

console.log(`Final state: dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}`);
