// programs/407-enter-portal-exact.js
console.log('=== EXACT PORTAL ENTRY ===');
console.log('Current pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Step 1: Walk to the sill block right in front: (299.5, 73.0, -53.0)
const sill = new Vec3(299.5, 73.0, -53.0);
await bot.lookAt(sill, true);
bot.setControlState('forward', true);
let t0 = Date.now();
while (bot.entity.position.distanceTo(sill) > 0.4 && Date.now() - t0 < 2000) {
  await sleep(50);
}
bot.clearControlStates();

// Step 2: Step directly into the portal block center: (299.5, 73.0, -53.5)
const portalCenter = new Vec3(299.5, 73.0, -53.5);
console.log(`Walking into portal center: ${lib.fmt(portalCenter)}...`);
await bot.lookAt(portalCenter, true);
bot.setControlState('forward', true);
t0 = Date.now();
while (bot.entity.position.distanceTo(portalCenter) > 0.25 && Date.now() - t0 < 2000) {
  await sleep(50);
}
bot.clearControlStates();

console.log('Arrived inside portal frame! Pos:', lib.fmt(bot.entity.position));
const blockInside = bot.blockAt(bot.entity.position);
console.log('Block at feet:', blockInside ? blockInside.name : 'null');

// Step 3: Stand completely motionless for transition
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Standing completely motionless inside nether_portal for warp...');
const deadline = Date.now() + 20000;
while (Date.now() < deadline && bot.game.dimension !== 'the_nether' && !isCancelled()) {
  await sleep(500);
  console.log(`Waiting... dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}`);
}

if (bot.game.dimension === 'the_nether') {
  console.log('WARP SUCCESSFUL! Arrived in the_nether!');
  bot.chat('gamma: Inside Nether Portal Bunker! Pos: ' + lib.fmt(bot.entity.position));
  await sleep(1000);
  bot.clearControlStates();
  // Step out of portal frame in Nether
  try {
    await lib.walkTo(40.5, -8.5, 2000);
  } catch (e) {}
} else {
  console.log('Transition did not trigger. Ending dim:', bot.game.dimension);
}

console.log('Final status:', JSON.stringify(lib.status()));
