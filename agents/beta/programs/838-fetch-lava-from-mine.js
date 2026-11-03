// programs/838-fetch-lava-from-mine.js
console.log('=== Program 838: Fetch Lava from Mine Lake (288, 19, 8) ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

// Equip pickaxe for safety
const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
if (pick) await bot.equip(pick, 'hand');

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = false;
moves.liquidsCost = 50;
bot.pathfinder.setMovements(moves);

bot.chat('Beta: Heading down mine shaft to scoop lava at (288, 19, 8) for portal repair!');

const descentWps = [
  new Vec3(302, 71, -44),
  new Vec3(304, 54, -34),
  new Vec3(299, 27, -30),
  new Vec3(288, 19, 8)
];

console.log('Starting descent to lava lake...');
for (let i = 0; i < descentWps.length; i++) {
  if (checkCancelled()) break;
  const wp = descentWps[i];
  console.log(`Advancing to descent WP ${i + 1}/${descentWps.length}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2.5, { dig: true, timeoutMs: 18000 });
  } catch (e) {
    console.log(`Descent WP ${i + 1} note: ${e.message}`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
    } catch (e2) {
      console.log(`Pathfinder fallback WP ${i + 1} note: ${e2.message}`);
    }
  }
  console.log(`Current pos: ${lib.fmt(bot.entity.position)}`);
}

// Check for lava sources
console.log('Scanning for lava source blocks...');
const lavaSources = bot.findBlocks({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 16,
  count: 10
});

console.log(`Found ${lavaSources.length} lava sources near:`, lib.fmt(bot.entity.position));

if (lavaSources.length > 0 && lib.count('lava_bucket') === 0) {
  const emptyBkt = bot.inventory.items().find(i => i.name === 'bucket');
  if (emptyBkt) {
    const targetLava = lavaSources[0];
    console.log(`Targeting lava source at ${lib.fmt(targetLava)}...`);
    // Move within safe reach (2.5m)
    try {
      await bot.pathfinder.goto(new goals.GoalNear(targetLava.x, targetLava.y + 1, targetLava.z, 2.2));
    } catch (e) {}

    await bot.equip(emptyBkt, 'hand');
    await bot.lookAt(targetLava.offset(0.5, 0.5, 0.5), true);
    bot.activateItem();
    await sleep(1000);
  }
}

console.log(`Lava bucket count in inventory: ${lib.count('lava_bucket')}`);

if (lib.count('lava_bucket') > 0) {
  bot.chat('Beta: Lava bucket secured! Ascending back to base portal!');
  
  const ascentWps = [
    new Vec3(299, 27, -30),
    new Vec3(304, 54, -34),
    new Vec3(302, 71, -44),
    new Vec3(297, 72, -54)
  ];

  for (let i = 0; i < ascentWps.length; i++) {
    if (checkCancelled()) break;
    const wp = ascentWps[i];
    console.log(`Ascending to WP ${i + 1}/${ascentWps.length}: ${lib.fmt(wp)}...`);
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2.0, { dig: true, timeoutMs: 20000 });
    } catch (e) {
      console.log(`Ascent WP ${i + 1} note: ${e.message}`);
      try {
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
      } catch (e2) {}
    }
  }

  console.log(`Reached surface! Position: ${lib.fmt(bot.entity.position)}`);

  // Place lava at sill (299, 72, -54)
  const sillPos = new Vec3(299, 72, -54);
  const curSill = bot.blockAt(sillPos);
  console.log(`Portal sill block before placing lava: ${curSill ? curSill.name : 'null'}`);
  
  if (curSill && curSill.name === 'air') {
    const lb = bot.inventory.items().find(i => i.name === 'lava_bucket');
    if (lb) {
      console.log('Placing lava into sill at (299, 72, -54)...');
      await bot.equip(lb, 'hand');
      await bot.lookAt(new Vec3(299.5, 72.1, -54.0), true);
      bot.activateItem();
      await sleep(1000);
      bot.chat('Beta: Placed lava into sill at (299, 72, -54)! Quench with water now!');
    }
  }

  // Quench with water if we have water_bucket and sill is lava
  const sillNow = bot.blockAt(sillPos);
  console.log(`Portal sill block now: ${sillNow ? sillNow.name : 'null'}`);
  if (sillNow && (sillNow.name === 'lava' || sillNow.name === 'flowing_lava') && lib.count('water_bucket') > 0) {
    console.log('Quenching lava with water_bucket...');
    const wb = bot.inventory.items().find(i => i.name === 'water_bucket');
    if (wb) {
      await bot.equip(wb, 'hand');
      await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
      bot.activateItem();
      await sleep(1500);

      // Scoop water back
      const bkt = bot.inventory.items().find(i => i.name === 'bucket');
      if (bkt) {
        await bot.equip(bkt, 'hand');
        await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
        bot.activateItem();
        await sleep(800);
      }
    }
  }

  const finalSill = bot.blockAt(sillPos);
  console.log(`Final sill block at (299, 72, -54): ${finalSill ? finalSill.name : 'null'}`);
  if (finalSill && finalSill.name === 'obsidian') {
    bot.chat('Beta: OBSIDIAN SILL CAST! Delta, ignite the portal with flint & steel!');
  }
}

return {
  pos: bot.entity.position,
  lava_bucket: lib.count('lava_bucket'),
  sill: bot.blockAt(new Vec3(299, 72, -54))?.name
};
