// programs/202-enter-base-and-sleep.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Time:', JSON.stringify(lib.time()));

// 1. Walk to base at (293, 72, -54)
bot.pathfinder.stop();
console.log('Walking 50m to base...');
bot.chat('delta: Running to base shelter before nightfall (70s)...');
try {
  await lib.goTo(293, 72, -54, 2);
} catch (err) {
  console.log('goTo base notice:', err.message);
  // Direct sprint fallback
  await bot.lookAt(new Vec3(293, 72, -54), true);
  bot.setControlState('forward', true);
  bot.setControlState('sprint', true);
  bot.setControlState('jump', true);
  await sleep(6000);
  bot.setControlState('forward', false);
  bot.setControlState('sprint', false);
  bot.setControlState('jump', false);
}

console.log('Near base pos:', lib.fmt(bot.entity.position));

// 2. Enter base shelter through door
const doorPos = new Vec3(294, 73, -54);
const door = bot.blockAt(doorPos) || bot.blockAt(new Vec3(294, 72, -54));
if (door && door.name.includes('door')) {
  try {
    await lib.goThroughDoor(door.position.x, door.position.y, door.position.z);
    console.log('Entered base through door!');
  } catch (err) {
    console.log('goThroughDoor error:', err.message);
    await lib.goTo(293, 72, -55, 1);
  }
} else {
  await lib.goTo(293, 72, -55, 1);
}

console.log('Inside base pos:', lib.fmt(bot.entity.position));

// 3. Set spawn point at bed
try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
  bot.chat('delta: Inside Base Camp! Bed spawn point locked.');
} catch (err) {
  console.log('setSpawn notice:', err.message);
}

// 4. Wait for sleep time if dusk approaches, and sleep
console.log('Waiting for sleep time (tick >= 12542)...');
for (let i = 0; i < 45; i++) {
  if (isCancelled()) break;
  const t = lib.time();
  if (t.canSleep) {
    console.log(`canSleep is true! Time: ${t.timeOfDay}. Attempting to sleep...`);
    try {
      await lib.sleepInBed();
      console.log('lib.sleepInBed completed successfully!');
      bot.chat('delta: Slept in bed, night skipped!');
    } catch (err) {
      console.log('sleepInBed error:', err.message);
    }
    break;
  }
  await sleep(1000);
}

console.log('Time after sleep:', JSON.stringify(lib.time()));

// 5. Check other players
for (const name in bot.players) {
  const p = bot.players[name];
  if (p && p.entity && p !== bot.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
  }
}

// 6. Check chest contents
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && chestBlock.name === 'chest') {
  try {
    const chest = await bot.openChest(chestBlock);
    console.log('Chest items:', chest.containerItems().map(i => `${i.name}x${i.count}`).join(', '));
    chest.close();
  } catch (err) {
    console.log('Chest notice:', err.message);
  }
}

console.log('Status final:', JSON.stringify(lib.status()));
