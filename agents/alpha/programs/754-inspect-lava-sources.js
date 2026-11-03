// programs/754-inspect-lava-sources.js
console.log('=== Program 754: Inspect Lava Properties & Test Scooping ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

const lavas = bot.findBlocks({
  matching: b => b && b.name.includes('lava'),
  maxDistance: 8,
  count: 10
});

console.log(`Lava blocks within 8m (${lavas.length}):`);
for (const lp of lavas) {
  const blk = bot.blockAt(lp);
  const props = blk.getProperties();
  const up = bot.blockAt(lp.offset(0, 1, 0));
  console.log(` - Pos: ${lib.fmt(lp)}, props: ${JSON.stringify(props)}, above: ${up?.name}`);
}

// Find source blocks (level == 0)
const sources = lavas.map(p => bot.blockAt(p)).filter(b => {
  const props = b.getProperties();
  return props.level === '0' || props.level === 0 || (!props.level && b.metadata === 0);
});

console.log(`Lava source blocks (${sources.length}):`, sources.map(s => lib.fmt(s.position)));

// Now test scooping on the first source block
if (sources.length > 0) {
  const src = sources[0];
  console.log(`Targeting lava source at ${lib.fmt(src.position)}...`);
  
  // Step closer
  try {
    await bot.pathfinder.goto(new goals.GoalNear(src.position.x, src.position.y + 1, src.position.z, 1.5));
  } catch (e) {}

  console.log('At position:', lib.fmt(bot.entity.position));
  
  // Equip bucket
  const bkt = bot.inventory.items().find(i => i.name === 'bucket');
  if (bkt) await bot.equip(bkt, 'hand');

  // Look directly at surface of lava source
  await bot.lookAt(src.position.offset(0.5, 0.9, 0.5), true);
  await sleep(250);

  // Method 1: activateItem
  bot.activateItem();
  await sleep(800);
  console.log('After activateItem, lava_bucket:', lib.count('lava_bucket'));

  // If not scooped, Method 2: activateBlock on the block adjacent or under the lava
  if (lib.count('lava_bucket') === 0) {
    console.log('Trying activateBlock on solid neighbor facing the lava...');
    // Find solid neighbor of src
    for (const off of [new Vec3(0, -1, 0), new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1)]) {
      const nb = bot.blockAt(src.position.plus(off));
      if (nb && nb.boundingBox === 'block' && nb.name !== 'lava') {
        console.log(`Activating solid neighbor at ${lib.fmt(nb.position)} with face toward lava...`);
        const face = off.scaled(-1);
        try {
          await bot.activateBlock(nb, face);
          await sleep(800);
          console.log('After activateBlock, lava_bucket:', lib.count('lava_bucket'));
          if (lib.count('lava_bucket') > 0) break;
        } catch (e) {
          console.log('activateBlock error:', e.message);
        }
      }
    }
  }

  // If still not scooped, Method 3: lib.fillBucket('lava')
  if (lib.count('lava_bucket') === 0) {
    console.log('Trying lib.fillBucket("lava")...');
    try {
      const res = await lib.fillBucket('lava');
      console.log('lib.fillBucket result:', res);
    } catch (e) {
      console.log('lib.fillBucket error:', e.message);
    }
  }
}

return {
  hasLava: lib.count('lava_bucket') > 0,
  pos: bot.entity.position,
  inv: lib.inv()
};
