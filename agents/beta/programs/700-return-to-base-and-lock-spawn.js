// programs/700-return-to-base-and-lock-spawn.js
console.log('=== Program 700: Return to Base & Lock Spawn ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);

bot.clearControlStates();
bot.pathfinder.stop();

// 1. Sprint back to Base (293, 72, -55)
console.log('Navigating to Overworld Base (293, 72, -55)...');
try {
  await lib.goTo(293, 72, -55, 2.0, { timeoutMs: 25000 });
} catch (e) {
  console.log('goTo Base note:', e.message);
  try { await lib.goToXZ(293, -55, { timeoutMs: 15000 }); } catch (e2) {}
}

console.log('Reached Base! Pos:', lib.fmt(bot.entity.position));

// 2. Lock bed spawn inside base
try {
  await lib.setSpawn();
  console.log('Locked bed spawn successfully!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 3. Mine 32 cobblestone nearby with stone pickaxe
console.log(`Current cobblestone: ${lib.count('cobblestone')}`);
const sp = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (sp) await bot.equip(sp, 'hand');

let mined = 0;
while (lib.count('cobblestone') < 32 && mined < 35 && !isCancelled()) {
  const stone = bot.findBlock({ matching: mcData.blocksByName.stone.id, maxDistance: 4.5 });
  if (stone) {
    try {
      await bot.dig(stone, true);
      await sleep(100);
      mined++;
    } catch (e) {
      break;
    }
  } else {
    break;
  }
}
await lib.pickup(5);
console.log(`Mined ${mined} cobblestone. Total: ${lib.count('cobblestone')}`);

// 4. Warp into Nether
console.log('Entering Nether Portal at (299.5, 73.0, -54.0)...');
try {
  await lib.goTo(299.5, 73.0, -54.0, 0.8, { timeoutMs: 8000 });
} catch (e) {}

const portalTarget = new Vec3(299.5, 73.0, -54.0);
const warpStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
  const cur = bot.entity.position;
  if (cur.distanceTo(portalTarget) > 0.8) {
    await bot.lookAt(portalTarget, true);
    bot.setControlState('forward', true);
    if (cur.y < 72.8) bot.setControlState('jump', true);
    await sleep(250);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }
  await sleep(350);
}
bot.clearControlStates();

if (bot.game.dimension === 'the_nether') {
  await sleep(400);
  await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
  bot.chat(`Beta: In the Nether with ${lib.count('cobblestone')} cobblestone and ${lib.count('blaze_rod')} Blaze Rod!`);
}

console.log('Program 700 complete. Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  cobblestone: lib.count('cobblestone'),
  blaze_rods: lib.count('blaze_rod')
};
