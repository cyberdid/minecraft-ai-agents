// programs/751-inspect-and-fill-lava.js
console.log('=== Program 751: Inspect Lava Pool & Fill Lava Bucket ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Scan for lava blocks within 16 blocks
const lavas = bot.findBlocks({
  matching: b => b && b.name.includes('lava'),
  maxDistance: 16,
  count: 10
});

console.log(`Found ${lavas.length} lava blocks:`);
for (const lp of lavas) {
  const blk = bot.blockAt(lp);
  console.log(` - Pos: ${lib.fmt(lp)}, name: ${blk.name}, props: ${JSON.stringify(blk.getProperties())}`);
}

// Try lib.fillBucket('lava')
try {
  console.log('Calling lib.fillBucket("lava")...');
  const res = await lib.fillBucket('lava');
  console.log('fillBucket result:', res);
} catch (err) {
  console.log('lib.fillBucket note:', err.message);
  
  // If lib.fillBucket failed, let's inspect why and manually scoop:
  if (lavas.length > 0) {
    const target = lavas[0];
    console.log(`Approaching first lava block at ${lib.fmt(target)}...`);
    await bot.pathfinder.goto(new goals.GoalNear(target.x, target.y + 1, target.z, 2.0));
    const bkt = bot.inventory.items().find(i => i.name === 'bucket');
    if (bkt) await bot.equip(bkt, 'hand');
    // In Minecraft 1.20, right clicking on a block or pointing directly at fluid
    // Target the block adjacent to or directly at the lava
    await bot.lookAt(new Vec3(target.x + 0.5, target.y + 0.8, target.z + 0.5), true);
    await sleep(200);
    bot.activateItem();
    await sleep(1000);
  }
}

console.log('Final lava_bucket count:', lib.count('lava_bucket'));
return {
  hasLava: lib.count('lava_bucket') > 0,
  pos: bot.entity.position,
  inv: lib.inv()
};
