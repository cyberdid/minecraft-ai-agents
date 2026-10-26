// programs/259-step-into-base-and-lock-spawn.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(150);

// 1. Sprint directly to base outside door at (293, 72, -54)
console.log('Sprinting remaining 29 blocks to base outside door at (293, 72, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(293, 72, -54, 1));
} catch (e) {
  console.log('Path note:', e.message);
  await bot.lookAt(new Vec3(293.5, 72.0, -54.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('sprint', true);
  await sleep(4000);
  bot.setControlState('forward', false);
  bot.setControlState('sprint', false);
}

console.log('Outside base! Pos:', lib.fmt(bot.entity.position));

// 2. Step through base door into base
console.log('Entering base shelter through door at (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door attempt note:', e.message);
}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// 3. Set spawn permanently at base bed
console.log('Locking spawn at base bed...');
try {
  const result = await lib.setSpawn();
  console.log('Spawn lock result:', result);
  bot.chat('delta: Spawn permanently locked at base bed! Never returning to world spawn.');
} catch (e) {
  console.log('Set spawn note:', e.message);
}

// 4. Quick gear-up: obtain stone_pickaxe
console.log('Obtaining stone_pickaxe...');
try {
  await lib.obtain('stone_pickaxe', 1);
  console.log('Stone pickaxe ready! Inv:', JSON.stringify(lib.inv()));
} catch (e) {
  console.log('Pickaxe obtain note:', e.message);
}

// 5. Mine 24 cobblestone and craft stone sword
if (lib.count('stone_pickaxe') > 0) {
  console.log('Quarrying cobblestone...');
  try {
    await lib.collect('cobblestone', 24);
    if (lib.count('stone_sword') < 1) {
      await lib.craft('stone_sword', 1);
    }
  } catch (e) {
    console.log('Cobble/sword note:', e.message);
  }
}

console.log('Ready to transit! Inv:', JSON.stringify(lib.inv()));
bot.chat(`delta: Geared with stone tools & ${lib.count('cobblestone')} cobble! Spawn locked. Entering Nether!`);

// 6. Step into Nether portal
console.log('Stepping into Nether portal...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(298, 72, -54, 2));
} catch (e) {}

await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
bot.setControlState('jump', true);
bot.setControlState('forward', true);
await sleep(800);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

const start = Date.now();
while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 15000)) {
  await sleep(500);
}

console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension === 'the_nether') {
  bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble!`);
}
