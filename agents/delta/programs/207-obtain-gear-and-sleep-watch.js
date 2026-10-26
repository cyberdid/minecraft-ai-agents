// programs/207-obtain-gear-and-sleep-watch.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Time info:', JSON.stringify(lib.time()));

bot.chat('delta: Obtaining stone pickaxe, sword, and 32 cobblestone for Nether mountain expedition...');

// 1. Obtain stone_pickaxe
console.log('Obtaining stone_pickaxe...');
try {
  await lib.obtain('stone_pickaxe', 1);
  console.log('Obtained stone_pickaxe!');
} catch (e) {
  console.log('obtain pickaxe error:', e.message);
}

// 2. Obtain stone_sword
console.log('Obtaining stone_sword...');
try {
  await lib.obtain('stone_sword', 1);
  console.log('Obtained stone_sword!');
} catch (e) {
  console.log('obtain sword error:', e.message);
}

// 3. Obtain 32 cobblestone
console.log('Obtaining 32 cobblestone...');
try {
  await lib.obtain('cobblestone', 32);
  console.log('Obtained 32 cobblestone!');
} catch (e) {
  console.log('obtain cobblestone error:', e.message);
}

// 4. Return inside base shelter
const doorPos = new Vec3(294, 73, -54);
console.log('Returning to base shelter...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
} catch (e) {
  await lib.goTo(293, 72, -55, 1);
}

// 5. If dusk/night has arrived, sleep in bed
const t = lib.time();
if (t.canSleep) {
  console.log('Dusk/night arrived! Sleeping in bed...');
  try {
    await lib.sleepInBed();
    console.log('Night skipped to morning!');
    bot.chat('delta: Slept in bed, morning arrived!');
  } catch (e) {
    console.log('Sleep notice:', e.message);
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final tools:', JSON.stringify(lib.tools()));
bot.chat(`delta: Re-armed! Pickaxe=${lib.count('stone_pickaxe')}, Sword=${lib.count('stone_sword')}, Cobble=${lib.count('cobblestone')}. Ready for Nether!`);
