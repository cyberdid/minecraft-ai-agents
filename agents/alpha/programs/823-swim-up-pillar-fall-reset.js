// programs/823-swim-up-pillar-fall-reset.js
console.log('=== Program 823: Swim Up Lava & Execute Fall Reset on Pillar ===');
console.log('Starting pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// 1. Swim up to surface of lava (y=32)
console.log('Swimming up to lava surface...');
bot.setControlState('jump', true);

const swimStart = Date.now();
while (bot.entity.position.y < 31.8 && Date.now() - swimStart < 6000) {
  await sleep(100);
}
bot.setControlState('jump', false);
console.log(`Reached surface: y = ${bot.entity.position.y.toFixed(2)}, pos = ${lib.fmt(bot.entity.position)}`);

// 2. Step onto solid nether_bricks at (45, 32, -124)
const pillarPos = new Vec3(45.5, 32.0, -124.5);
console.log('Moving onto pillar ledge at:', lib.fmt(pillarPos));
await bot.lookAt(pillarPos, true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(800);
bot.clearControlStates();

console.log(`Standing at: ${lib.fmt(bot.entity.position)}, on block: ${bot.blockAt(bot.entity.position.offset(0, -1, 0))?.name}`);

// 3. Equip cobblestone
const cobble = bot.inventory.items().find(it => it.name === 'cobblestone');
if (cobble) await bot.equip(cobble, 'hand');

// Look straight down
await bot.look(bot.entity.yaw, -Math.PI / 2, true);

// 4. Pillar up 5 blocks on the solid pillar
const startY = bot.entity.position.y;
console.log(`Pillaring up from y = ${startY.toFixed(2)}...`);

for (let i = 0; i < 6; i++) {
  const blockBelow = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  if (!blockBelow || blockBelow.name === 'lava' || blockBelow.name === 'air') {
    // Try to find solid block under feet or neighbor
  }
  bot.setControlState('jump', true);
  await sleep(220);
  try {
    const curBelow = bot.blockAt(bot.entity.position.offset(0, -1, 0));
    if (curBelow) await bot.placeBlock(curBelow, new Vec3(0, 1, 0));
  } catch (e) {
    console.log(`Step ${i} error:`, e.message);
  }
  bot.setControlState('jump', false);
  await sleep(220);
}

const peakY = bot.entity.position.y;
console.log(`Peak y = ${peakY.toFixed(2)}, climbed: ${(peakY - startY).toFixed(2)} blocks`);

// 5. Step off onto the pillar ledge to take fall damage reset
if (peakY - startY >= 4) {
  console.log('Stepping off pillar to trigger clean 20/20 HP reset...');
  bot.chat('alpha: Triggering fall damage reset from pillar to restore 20/20 HP & Food at Base Bed!');
  await bot.lookAt(pillarPos, true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.clearControlStates();
}

// 6. Wait for respawn in Overworld
console.log('Waiting for respawn cycle...');
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 15000) {
  await sleep(250);
}

console.log(`Post-reset: dim = ${bot.game.dimension}, pos = ${lib.fmt(bot.entity.position)}, HP = ${bot.health}, Food = ${bot.food}`);
