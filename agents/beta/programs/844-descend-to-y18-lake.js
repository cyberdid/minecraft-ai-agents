// programs/844-descend-to-y18-lake.js
console.log('=== Program 844: Descend to y=18 Lake & Scoop Lava ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
if (pick) await bot.equip(pick, 'hand');

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = false;
moves.liquidsCost = 50;
bot.pathfinder.setMovements(moves);

console.log(`Current pos: ${lib.fmt(bot.entity.position)}`);

// Stage 1: (302, 35, -38)
console.log('Descending to (302, 35, -38)...');
try {
  await lib.goTo(302, 35, -38, 2.0, { dig: true, timeoutMs: 15000 });
} catch (e) {
  console.log(`Stage 1 note: ${e.message}`);
}
console.log(`Pos after stage 1: ${lib.fmt(bot.entity.position)}`);

// Stage 2: (302, 18, -32)
console.log('Descending to (302, 18, -32)...');
try {
  await lib.goTo(302, 18, -32, 2.0, { dig: true, timeoutMs: 18000 });
} catch (e) {
  console.log(`Stage 2 note: ${e.message}`);
}
console.log(`Pos after stage 2: ${lib.fmt(bot.entity.position)}`);

// Stage 3: Walk towards lava lake (288, 19, 8)
console.log('Advancing towards lava lake (288, 19, 8)...');
try {
  await lib.goTo(288, 19, 8, 3.0, { dig: true, timeoutMs: 20000 });
} catch (e) {
  console.log(`Stage 3 note: ${e.message}`);
}
console.log(`Pos near lava lake: ${lib.fmt(bot.entity.position)}`);

// Scan for lava source blocks
const lavas = bot.findBlocks({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 32,
  count: 20
});

console.log(`Found ${lavas.length} lava source blocks near ${lib.fmt(bot.entity.position)}:`);
for (const lp of lavas.slice(0, 5)) {
  console.log(`  Source at ${lib.fmt(lp)} (dist: ${bot.entity.position.distanceTo(lp).toFixed(1)}m)`);
}

// Scoop lava if we have empty bucket
if (lavas.length > 0 && lib.count('bucket') > 0 && lib.count('lava_bucket') === 0) {
  const target = lavas[0];
  console.log(`Approaching and scooping lava source at ${lib.fmt(target)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(target.x, target.y + 1, target.z, 2.5));
  } catch (e) {}
  
  const bkt = bot.inventory.items().find(i => i.name === 'bucket');
  if (bkt) {
    await bot.equip(bkt, 'hand');
    await bot.lookAt(target.offset(0.5, 0.5, 0.5), true);
    bot.activateItem();
    await sleep(1000);
    console.log(`Lava bucket count now: ${lib.count('lava_bucket')}`);
    if (lib.count('lava_bucket') > 0) {
      bot.chat('Beta: LAVA BUCKET SECURED! Ascending to surface portal frame!');
    }
  }
}

return {
  pos: bot.entity.position,
  lavaSources: lavas.length,
  lava_bucket: lib.count('lava_bucket')
};
