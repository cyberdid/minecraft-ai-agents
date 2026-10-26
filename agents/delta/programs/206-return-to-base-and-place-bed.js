// programs/206-return-to-base-and-place-bed.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));

// 1. Run to base at (293, 72, -54)
bot.pathfinder.stop();
console.log('Running 100m to base...');
bot.chat('delta: Running 100m back to Base Camp (293, 72, -54)...');

try {
  await lib.goTo(293, 72, -54, 2);
} catch (err) {
  console.log('goTo base notice:', err.message);
  // Sprint fallback
  await bot.lookAt(new Vec3(293, 72, -54), true);
  bot.setControlState('forward', true);
  bot.setControlState('sprint', true);
  bot.setControlState('jump', true);
  await sleep(10000);
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

// 3. Check beds inside base
const beds = bot.findBlocks({
  matching: b => bot.isABed(b),
  maxDistance: 8,
  count: 3
});
console.log(`Found ${beds.length} beds inside base`);

// If Delta carries a bed and base has < 2 beds, place it
if (lib.count('white_bed') > 0 && beds.length < 2) {
  console.log('Placing bed at (294, 72, -55)...');
  try {
    await lib.place('white_bed', 294, 72, -55);
    console.log('Placed white_bed!');
  } catch (err) {
    console.log('Bed place notice:', err.message);
  }
}

// 4. Lock bed spawn
try {
  await lib.setSpawn();
  console.log('Spawn successfully set at base bed!');
  bot.chat('delta: Inside Base Camp! Bed spawn point locked.');
} catch (err) {
  console.log('setSpawn notice:', err.message);
}

// 5. Check other players
for (const name in bot.players) {
  const p = bot.players[name];
  if (p && p.entity && p !== bot.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
  }
}

console.log('Delta inventory:', JSON.stringify(lib.inv()));
console.log('Status final:', JSON.stringify(lib.status()));
