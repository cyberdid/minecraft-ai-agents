// programs/393-transit-to-nether.js
console.log('=== OVERWORLD TO NETHER TRANSIT ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Inv:', JSON.stringify(lib.inv()));

// 1. Exit base door if inside
if (bot.entity.position.z < -53.5) {
  console.log('Exiting base door to outside...');
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    try {
      await lib.door(294, 72, -54, true);
      await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -53));
      await lib.door(294, 72, -54, false);
    } catch (e2) {}
  }
}

// 2. Move to portal frame at (298, 72, -54)
console.log('Moving to portal entrance...');
const portalEntry = new Vec3(297.0, 72.0, -53.5);
try {
  await lib.goTo(portalEntry.x, portalEntry.y, portalEntry.z, 1, { dig: false, timeoutMs: 8000 });
} catch (e) {
  await bot.pathfinder.goto(new goals.GoalNear(portalEntry.x, portalEntry.y, portalEntry.z, 1));
}

// 3. Step inside portal block (y=73)
console.log('Stepping inside portal block at (298.5, 73.0, -53.5)...');
bot.setControlState('jump', true);
bot.setControlState('forward', true);
await sleep(400);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

// Precise positioning inside portal hitbox
try {
  await bot.pathfinder.goto(new goals.GoalBlock(298, 73, -54));
} catch (e) {}

console.log('Inside portal frame! Waiting for Nether transition...');
const deadline = Date.now() + 15000;
while (Date.now() < deadline && bot.game.dimension !== 'the_nether' && !isCancelled()) {
  await sleep(500);
}

if (bot.game.dimension === 'the_nether') {
  console.log('TRANSIT SUCCESS! Dimension is now the_nether!');
  bot.chat('gamma: Successfully transited to Nether! Bunker pos: ' + lib.fmt(bot.entity.position));
  // Step clear of portal hitbox
  try {
    await lib.walkTo(40.5, -8.5, 2000);
  } catch (e) {}
} else {
  console.log('Still in dimension:', bot.game.dimension, 'at pos:', lib.fmt(bot.entity.position));
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  inv: lib.inv(),
  hp: bot.health,
  food: bot.food
};
