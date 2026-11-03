// programs/831-cast-obsidian-and-relight-portal.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 831: Craft Bucket, Scoop Lava & Cast Obsidian ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Step 1: Craft empty bucket from 3 iron ingots at base Crafting Table (295, 72, -56)
if (lib.count('bucket') === 0) {
  console.log('Crafting empty bucket from 3 iron ingots...');
  try {
    await lib.goTo(295, 72, -55, 1.2, { timeoutMs: 4000 });
    await lib.craft('bucket', 1);
    console.log('Crafted bucket! Total buckets now: bucket=' + lib.count('bucket') + ', water_bucket=' + lib.count('water_bucket'));
  } catch (e) {
    console.log('Craft bucket error:', e.message);
  }
}

// Step 2: Walk to surface lava pool at (333, 62, -78)
bot.chat('Beta: Sprinting to surface lava pool (333, 62, -78) to scoop lava bucket for portal repair!');
console.log('Navigating to surface lava pool at (333, 62, -78)...');

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

const lavaApproachWps = [
  new Vec3(310, 68, -65),
  new Vec3(325, 64, -72),
  new Vec3(330, 63, -76)
];

for (const wp of lavaApproachWps) {
  if (isCancelled()) break;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
  } catch (e) {
    try { await lib.goTo(wp.x, wp.y, wp.z, 2.5, { timeoutMs: 6000 }); } catch (e2) {}
  }
}

console.log('Near lava pool at:', lib.fmt(bot.entity.position));

// Step 3: Scoop lava into empty bucket
if (lib.count('bucket') > 0 && lib.count('lava_bucket') === 0) {
  console.log('Finding lava source block...');
  const lavaSources = bot.findBlocks({
    matching: b => b && b.name === 'lava' && b.metadata === 0,
    maxDistance: 10,
    count: 5
  });

  if (lavaSources.length > 0) {
    const targetLava = lavaSources[0];
    console.log(`Scooping lava source at ${lib.fmt(targetLava)}...`);
    const emptyBkt = bot.inventory.items().find(i => i.name === 'bucket');
    if (emptyBkt) {
      await bot.equip(emptyBkt, 'hand');
      await bot.lookAt(targetLava.offset(0.5, 0.5, 0.5), true);
      bot.activateItem();
      await sleep(1000);
    }
  }
}

console.log(`Lava buckets in inventory: ${lib.count('lava_bucket')}`);

// Step 4: Return to portal frame at (297, 72, -54)
bot.chat('Beta: Scooped lava! Returning to portal frame (299, 72, -54) to cast obsidian!');
const returnWps = [
  new Vec3(320, 65, -70),
  new Vec3(305, 70, -60),
  new Vec3(297, 72, -54)
];

for (const wp of returnWps) {
  if (isCancelled()) break;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try { await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 6000 }); } catch (e2) {}
  }
}

console.log('At portal frame:', lib.fmt(bot.entity.position));

// Step 5: Place lava at (299, 72, -54)
const sillPos = new Vec3(299, 72, -54);
const curSill = bot.blockAt(sillPos);
console.log(`Current sill block before cast: ${curSill ? curSill.name : 'null'}`);

if (curSill && curSill.name === 'air' && lib.count('lava_bucket') > 0) {
  console.log('Placing lava into sill basin at (299, 72, -54)...');
  const lb = bot.inventory.items().find(i => i.name === 'lava_bucket');
  if (lb) {
    await bot.equip(lb, 'hand');
    // Place against solid floor at y=71 or neighbor at (298, 72, -54)
    const ref = bot.blockAt(new Vec3(299, 71, -54)) || bot.blockAt(new Vec3(298, 72, -54));
    if (ref) {
      await bot.lookAt(new Vec3(299.5, 72.2, -54.0), true);
      bot.activateItem();
      await sleep(1000);
    }
  }
}

// Step 6: Quench with water bucket
const sillAfterLava = bot.blockAt(sillPos);
console.log(`Sill after lava placement: ${sillAfterLava ? sillAfterLava.name : 'null'}`);

if (sillAfterLava && (sillAfterLava.name === 'lava' || sillAfterLava.name === 'flowing_lava') && lib.count('water_bucket') > 0) {
  console.log('Quenching lava with water bucket...');
  const wb = bot.inventory.items().find(i => i.name === 'water_bucket');
  if (wb) {
    await bot.equip(wb, 'hand');
    await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
    bot.activateItem();
    await sleep(1500);

    // Scoop water back with empty bucket
    const bkt = bot.inventory.items().find(i => i.name === 'bucket');
    if (bkt) {
      await bot.equip(bkt, 'hand');
      await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
      bot.activateItem();
      await sleep(800);
    }
  }
}

// Final check of sill block
const finalSill = bot.blockAt(sillPos);
console.log(`Final sill block at (299, 72, -54): ${finalSill ? finalSill.name : 'null'}`);

if (finalSill && finalSill.name === 'obsidian') {
  bot.chat('Beta: SUCCESS! Obsidian sill cast at (299, 72, -54)! Frame is 100% complete! Delta, ignite with flint & steel!');
}

return {
  sill_block: finalSill ? finalSill.name : 'null',
  lava_bucket: lib.count('lava_bucket'),
  water_bucket: lib.count('water_bucket')
};
