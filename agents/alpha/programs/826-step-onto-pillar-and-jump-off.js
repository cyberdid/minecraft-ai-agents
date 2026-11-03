// programs/826-step-onto-pillar-and-jump-off.js
console.log('=== Program 826: Step onto Pillar & Tower Fall Reset ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 1. Swim up to y=33 and move onto pillar at (45.5, 33.0, -124.5)
const target = new Vec3(45.5, 33.0, -124.5);
console.log('Moving onto pillar top at:', lib.fmt(target));

// Hold jump and move forward towards (45.5, -124.5)
await bot.lookAt(target, true);
bot.setControlState('jump', true);
bot.setControlState('forward', true);

const climbStart = Date.now();
while (bot.entity.position.y < 32.8 && Date.now() - climbStart < 4000) {
  await sleep(100);
}
await sleep(400);
bot.clearControlStates();

console.log('Now at:', lib.fmt(bot.entity.position), 'on ground:', bot.entity.onGround, 'in lava:', bot.entity.isInLava);
console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);

// 2. Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (cobble) await bot.equip(cobble, 'hand');

// 3. Pillar up 5 blocks on the solid pillar
const startY = bot.entity.position.y;
console.log(`Starting tower from y = ${startY.toFixed(2)}...`);

for (let step = 0; step < 6 && bot.health > 0; step++) {
  await bot.look(bot.entity.yaw, -Math.PI / 2, true);
  const below = bot.blockAt(bot.entity.position.offset(0, -0.2, 0));
  
  bot.setControlState('jump', true);
  await sleep(220);
  
  if (below && below.name !== 'air' && below.name !== 'lava') {
    try {
      await bot.placeBlock(below, new Vec3(0, 1, 0));
      console.log(`Step ${step} placed block at y = ${below.position.y + 1}`);
    } catch (e) {
      console.log(`Step ${step} place error:`, e.message);
    }
  }
  
  bot.setControlState('jump', false);
  await sleep(250);
}

const peakY = bot.entity.position.y;
console.log(`Peak Y = ${peakY.toFixed(2)}, climbed = ${(peakY - startY).toFixed(2)} blocks`);

// 4. Step off pillar onto the solid nether brick ledge (45, 33, -125)
if (peakY - startY >= 3.5) {
  console.log('Stepping off pillar to trigger 20/20 HP reset...');
  bot.chat('alpha: Fall damage reset from pillar! Respawning at Overworld Base Bed!');
  await bot.look(0, 0, true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.clearControlStates();
}

// 5. Wait for respawn in Overworld
console.log('Waiting for respawn cycle...');
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 15000) {
  await sleep(250);
}

console.log(`Final state: dim = ${bot.game.dimension}, pos = ${lib.fmt(bot.entity.position)}, HP = ${bot.health}, Food = ${bot.food}`);
