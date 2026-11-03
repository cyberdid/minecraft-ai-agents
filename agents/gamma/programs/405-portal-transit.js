// programs/405-portal-transit.js
console.log('=== EXACT NETHER PORTAL ENTRY ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Locate nether_portal blocks
const portalId = mcData.blocksByName.nether_portal?.id;
const portals = bot.findBlocks({ matching: portalId, maxDistance: 8, count: 10 });
console.log(`Found ${portals.length} nether_portal blocks:`, portals.map(p => lib.fmt(p)).join(', '));

if (portals.length === 0) {
  console.log('ERROR: No nether_portal blocks found within 8m!');
  return;
}

// Choose the center-most portal block at the lowest y
const targetPortal = portals.sort((a, b) => a.y - b.y)[0];
console.log(`Targeting nether_portal block at: ${lib.fmt(targetPortal)}`);

// 2. Clear pathfinder and walk directly into the center of targetPortal
bot.pathfinder.setGoal(null);
bot.clearControlStates();

const targetCenter = new Vec3(targetPortal.x + 0.5, targetPortal.y, targetPortal.z + 0.5);
console.log(`Moving to center: ${lib.fmt(targetCenter)}`);

// If we are below the portal floor (e.g. y=72), jump up
if (bot.entity.position.y < targetPortal.y - 0.2) {
  bot.setControlState('jump', true);
  await sleep(300);
  bot.setControlState('jump', false);
}

// Use precise lookAt and forward movement to reach portal center
await bot.lookAt(targetCenter, true);
bot.setControlState('forward', true);
const startMove = Date.now();
while (bot.entity.position.distanceTo(targetCenter) > 0.3 && Date.now() - startMove < 3000) {
  await sleep(50);
}
bot.clearControlStates();
console.log(`Arrived at: ${lib.fmt(bot.entity.position)}`);

// 3. Stand completely still inside the nether_portal block
console.log('Standing completely still inside nether_portal for transition...');
bot.clearControlStates();
bot.pathfinder.setGoal(null);

const deadline = Date.now() + 20000;
while (Date.now() < deadline && bot.game.dimension !== 'the_nether' && !isCancelled()) {
  await sleep(500);
  console.log(`Waiting in portal... dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}`);
}

if (bot.game.dimension === 'the_nether') {
  console.log('TRANSIT CONFIRMED! Successfully entered the Nether!');
  bot.chat('gamma: Inside Nether Portal Bunker! Pos: ' + lib.fmt(bot.entity.position));
  
  // Clear portal hitbox in Nether
  await sleep(1000);
  bot.clearControlStates();
  try {
    await lib.walkTo(40.5, -8.5, 2000);
  } catch (e) {}
} else {
  console.log('Transition did not trigger. Current dim:', bot.game.dimension);
}

console.log('Ending status:', JSON.stringify(lib.status()));
