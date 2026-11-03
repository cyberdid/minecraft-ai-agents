// programs/401-mine-cobble-and-transit-nether.js
console.log('=== OVERWORLD PREP & NETHER TRANSIT ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Inv:', JSON.stringify(lib.inv()));

// 1. Eat apple to top up food/saturation
try {
  if (lib.count('apple') > 0) {
    await lib.eat();
    console.log('Ate apple. Food:', bot.food);
  }
} catch (e) {}

// 2. Mine cobblestone if needed to reach ~35+ cobble
if (lib.count('cobblestone') < 35) {
  const needed = 35 - lib.count('cobblestone');
  console.log(`Mining ${needed} stone for Nether building/defense...`);
  try {
    await lib.collect('stone', needed);
    console.log(`Stone collected! Total cobble: ${lib.count('cobblestone')}`);
  } catch (e) {
    console.log('collect stone note:', e.message);
  }
}

// 3. Move to portal entrance at (297.0, 72.0, -53.5)
console.log('Moving to Nether portal...');
const portalEntry = new Vec3(297.0, 72.0, -53.5);
try {
  await lib.goTo(portalEntry.x, portalEntry.y, portalEntry.z, 1, { dig: false, timeoutMs: 8000 });
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(portalEntry.x, portalEntry.y, portalEntry.z, 1));
  } catch (e2) {}
}

// 4. Step inside portal block (y=73)
console.log('Stepping into portal at (298.5, 73.0, -53.5)...');
bot.setControlState('jump', true);
bot.setControlState('forward', true);
await sleep(400);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

try {
  await bot.pathfinder.goto(new goals.GoalBlock(298, 73, -54));
} catch (e) {}

console.log('Inside portal frame! Waiting for Nether transition...');
const deadline = Date.now() + 18000;
while (Date.now() < deadline && bot.game.dimension !== 'the_nether' && !isCancelled()) {
  await sleep(500);
}

if (bot.game.dimension === 'the_nether') {
  console.log('TRANSIT COMPLETE! Dimension is now the_nether!');
  bot.chat('gamma: Successfully transited to Nether! Pos: ' + lib.fmt(bot.entity.position));
  
  // Step clear of the portal block so portal effect resets
  try {
    await lib.walkTo(40.5, -8.5, 2000);
  } catch (e) {}
} else {
  console.log('Transit pending or still in:', bot.game.dimension, 'at pos:', lib.fmt(bot.entity.position));
}

console.log('Ending status:', JSON.stringify(lib.status()));
