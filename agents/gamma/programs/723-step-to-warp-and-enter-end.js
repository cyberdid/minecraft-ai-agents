// programs/723-step-to-warp-and-enter-end.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 723: STEP TO STRONGHOLD WARP & ENTER END ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// Step 1: Hop up the 14 blocks to (233, 70, -98)
const warpTarget = new Vec3(233.0, 70.0, -98.0);
console.log(`Advancing to warp at ${lib.fmt(warpTarget)}...`);

await bot.lookAt(warpTarget, true);
bot.setControlState('forward', true);
const startHop = Date.now();
while (bot.entity.position.distanceTo(warpTarget) > 1.5 && bot.entity.position.x < 2000 && Date.now() - startHop < 8000 && !isCancelled()) {
  await bot.lookAt(new Vec3(warpTarget.x, bot.entity.position.y + 1.0, warpTarget.z), true);
  if (bot.entity.isCollidedHorizontally || warpTarget.y > bot.entity.position.y + 0.3) {
    bot.setControlState('jump', true);
    await sleep(150);
    bot.setControlState('jump', false);
  }
  await sleep(50);
}
bot.clearControlStates();

console.log('Pos after warp attempt:', lib.fmt(bot.entity.position));

// Step 2: If in Stronghold (x > 2000), step into End Portal (2215.5, -9.0, 1466.5)
if (bot.entity.position.x > 2000 && bot.game.dimension === 'overworld') {
  console.log('In Stronghold! Stepping into End Portal (2215, -9, 1466)...');
  const pBlock = new Vec3(2215.5, -9.0, 1466.5);
  await bot.lookAt(pBlock, true);
  bot.setControlState('forward', true);
  const startP = Date.now();
  while (bot.game.dimension === 'overworld' && Date.now() - startP < 10000 && !isCancelled()) {
    if (bot.entity.position.distanceTo(pBlock) > 0.4) {
      await bot.lookAt(pBlock, true);
      bot.setControlState('forward', true);
      if (bot.entity.isCollidedHorizontally || bot.entity.position.y < -8.5) {
        bot.setControlState('jump', true);
        await sleep(150);
        bot.setControlState('jump', false);
      }
    }
    await sleep(100);
  }
  bot.clearControlStates();
}

console.log('Dimension now:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// Step 3: If in The End, move through tunnel West onto Main Island surface
if (bot.game.dimension === 'the_end') {
  bot.chat('gamma: Successfully in The End! Moving to Main Island surface to scout End Gateway!');
  console.log('=== ARRIVED IN THE END ===');
  console.log('Pos:', lib.fmt(bot.entity.position));

  // If on spawn platform (x >= 90), advance West
  if (bot.entity.position.x > 30.0) {
    for (let targetX = 98; targetX >= 25 && !isCancelled(); targetX -= 4) {
      await bot.lookAt(new Vec3(targetX, bot.entity.position.y, 0), true);
      bot.setControlState('forward', true);
      if (bot.entity.isCollidedHorizontally) {
        bot.setControlState('jump', true);
        await sleep(150);
        bot.setControlState('jump', false);
      }
      await sleep(300);
    }
    bot.clearControlStates();
  }

  // Scan for End Gateway portal blocks (3x3 bedrock with end_gateway in center)
  const gateways = bot.findBlocks({
    matching: b => b && (b.name === 'end_gateway' || b.name === 'bedrock'),
    maxDistance: 96,
    count: 32
  });

  const activeGateways = gateways.filter(p => bot.blockAt(p)?.name === 'end_gateway');
  console.log(`Found ${activeGateways.length} active End Gateway portals!`);
  for (const gp of activeGateways) {
    console.log(`ACTIVE END GATEWAY AT ${lib.fmt(gp)}!`);
    bot.chat(`team: ACTIVE END GATEWAY CONFIRMED AT ${lib.fmt(gp)}! Ready for Outer End warp!`);
  }

  // Equip netherite sword and shield
  try { await lib.equipArmor(); } catch (e) {}
  const ns = bot.inventory.items().find(i => i.name === 'netherite_sword');
  if (ns) await bot.equip(ns, 'hand');
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
