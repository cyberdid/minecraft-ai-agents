// programs/105-repair-base-door-and-floor.js
console.log('--- REPAIR BASE FLOOR & DOOR ---');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Move to chest at (293, 72, -57)
console.log('Moving to chest at (293, 72, -57)...');
try {
  await lib.walkTo(293, -56.5);
} catch (e) {}

// Withdraw door and tuff floor blocks
await lib.withdraw({ oak_door: 1, tuff: 4 }, 293, 72, -57);
console.log('Withdrew door & tuff. Inv:', JSON.stringify(lib.inv()));

// 2. Repair floor at (294, 71, -54)
const floorBlock = bot.blockAt(new Vec3(294, 71, -54));
console.log(`Floor at (294, 71, -54) is: ${floorBlock?.name}`);
if (!floorBlock || floorBlock.boundingBox !== 'block') {
  console.log('Placing tuff floor block at (294, 71, -54)...');
  try {
    await lib.place('tuff', 294, 71, -54);
    console.log('Floor repaired!');
  } catch (e) {
    console.log('Floor repair note:', e.message);
  }
}

// 3. Place oak_door at (294, 72, -54)
const doorBlock = bot.blockAt(new Vec3(294, 72, -54));
console.log(`Doorway at (294, 72, -54) is: ${doorBlock?.name}`);
if (!doorBlock || !doorBlock.name.includes('door')) {
  console.log('Placing oak_door at (294, 72, -54)...');
  try {
    await lib.place('oak_door', 294, 72, -54);
    console.log('Door placed!');
  } catch (e) {
    console.log('Door place note:', e.message);
  }
}

// 4. Test goThroughDoor to step outside to (294, 72, -53)
console.log('Testing stepping through door to exterior...');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('OUTSIDE BASE AT:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('goThroughDoor note:', e.message);
}

// 5. Walk to Nether portal at (299, 73, -54)
console.log('Approaching Nether portal at (299, 73, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
  console.log('At portal block! Waiting for Nether transit...');
  const t0 = Date.now();
  while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
    await sleep(1000);
  }
} catch (e) {
  console.log('Portal transit note:', e.message);
}

console.log('Current dim:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
bot.chat(`gamma at ${lib.fmt(bot.entity.position)} in ${bot.game.dimension}! Base door & floor repaired.`);
