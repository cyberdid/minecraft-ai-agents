// programs/265-enter-base-and-lock-bed2.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(150);

// 1. Sprint remaining 28 blocks to base door
console.log('Sprinting remaining 28 blocks to base outside door (293, 72, -54)...');
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

// 2. Step inside base through door at (294, 72, -54)
console.log('Entering base shelter through door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door attempt note:', e.message);
}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// 3. Set spawn permanently on Bed 2
const beds = bot.findBlocks({ matching: b => b.name.endsWith('_bed'), maxDistance: 8, count: 5 });
console.log('Beds in base:', beds.map(p => lib.fmt(p)));

if (beds.length > 1) {
  console.log('Locking spawn on Bed 2 at', lib.fmt(beds[1]));
  await bot.activateBlock(bot.blockAt(beds[1]));
  bot.chat(`delta: Spawn permanently locked at base Bed 2 (${lib.fmt(beds[1])})!`);
} else if (beds.length === 1) {
  console.log('Locking spawn on Bed at', lib.fmt(beds[0]));
  await bot.activateBlock(bot.blockAt(beds[0]));
  bot.chat(`delta: Spawn locked at base Bed (${lib.fmt(beds[0])})!`);
}

// 4. Obtain stone pickaxe
console.log('Obtaining stone_pickaxe...');
try {
  await lib.obtain('stone_pickaxe', 1);
  console.log('Stone pickaxe ready! Inv:', JSON.stringify(lib.inv()));
} catch (e) {
  console.log('Pickaxe obtain note:', e.message);
}

// 5. Mine 24 cobblestone and craft stone sword
if (lib.count('stone_pickaxe') > 0) {
  console.log('Mining cobblestone...');
  try {
    await lib.collect('cobblestone', 24);
    if (lib.count('stone_sword') < 1) {
      await lib.craft('stone_sword', 1);
    }
  } catch (e) {
    console.log('Cobble/sword note:', e.message);
  }
}

console.log('Gear ready! Inv:', JSON.stringify(lib.inv()));
bot.chat(`delta: Armed with stone tools & ${lib.count('cobblestone')} cobble! Stepping into Nether portal!`);

// 6. Step into Nether portal
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
  bot.chat(`delta: In Nether at ${lib.fmt(bot.entity.position)} with stone gear & ${lib.count('cobblestone')} cobble!`);
}
