console.log('=== PROGRAM 704: FOLLOW GAMMA INTO PORTAL 2 (41, 65, -7) ===');
globalThis.isProgramCancelled = isCancelled;

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.chat('delta: Walking through cleared tunnel at z=-7 into Nether Portal!');

// Equip pickaxe for digging assistance
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Walk straight West along z=-7 from current x down to x=41
for (let x = Math.floor(bot.entity.position.x); x >= 41 && !isCancelled(); x--) {
  const headPos = new Vec3(x, 66, -7);
  const feetPos = new Vec3(x, 65, -7);

  const head = bot.blockAt(headPos);
  if (head && head.boundingBox === 'block' && head.name !== 'nether_portal' && !globalThis.isProtectedBlock(head)) {
    try {
      await bot.lookAt(headPos.offset(0.5, 0.5, 0.5), true);
      await bot.dig(head, true);
    } catch (e) {}
  }

  const feet = bot.blockAt(feetPos);
  if (feet && feet.boundingBox === 'block' && feet.name !== 'nether_portal' && !globalThis.isProtectedBlock(feet)) {
    try {
      await bot.lookAt(feetPos.offset(0.5, 0.5, 0.5), true);
      await bot.dig(feet, true);
    } catch (e) {}
  }

  // Step forward
  await bot.lookAt(new Vec3(x, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  const stepStart = Date.now();
  while (bot.entity.position.x > x + 0.3 && Date.now() - stepStart < 1500) {
    if (bot.entity.isCollidedHorizontally) {
      bot.setControlState('jump', true);
      await sleep(200);
      bot.setControlState('jump', false);
    }
    await sleep(50);
  }
  bot.setControlState('forward', false);

  // Check if inside nether portal
  const curBlock = bot.blockAt(bot.entity.position);
  if (curBlock && curBlock.name === 'nether_portal') {
    console.log('Inside nether_portal block at:', lib.fmt(bot.entity.position));
    break;
  }
}

// Find nearest portal block and step inside
let portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
if (portalBlock) {
  console.log(`Entering portal at ${lib.fmt(portalBlock.position)}...`);
  await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);

  console.log('Waiting for dimension warp to Overworld...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(250);
  }
}

console.log('Current dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// In Overworld: enter Base House at (293, 72, -55)
if (bot.game.dimension === 'overworld') {
  console.log('In Overworld! Walking into Base House (293, 72, -55)...');
  try {
    if (bot.entity.position.distanceTo(new Vec3(293.5, 72.0, -56.0)) > 3.0) {
      await lib.goToXZ(294, -53, { timeoutMs: 12000 });
      await lib.goThroughDoor(294, 72, -54);
    }
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -56.0, 1.0));
    } catch (e2) {}
  }

  // Inside base house
  console.log('Secure inside Base House! Final pos:', lib.fmt(bot.entity.position));
  bot.chat(`delta: Secure in Overworld Base House! HP: ${bot.health}/20, Food: ${bot.food}/20. Team ready for Stronghold expedition!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
