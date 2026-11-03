// programs/756-test-generic-place-scoop.js
console.log('=== Program 756: Test Generic Place Scoop ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

const srcPos = new Vec3(346, 40, -79);
const srcBlock = bot.blockAt(srcPos);
console.log(`Block at (346, 40, -79): ${srcBlock?.name}, props: ${JSON.stringify(srcBlock?.getProperties())}`);
console.log(`Block at (346, 41, -79): ${bot.blockAt(srcPos.offset(0, 1, 0))?.name}`);

// Move right to (345, 41, -79)
await bot.pathfinder.goto(new goals.GoalNear(345, 41, -79, 1.2));
console.log('Now at:', lib.fmt(bot.entity.position));

const bkt = bot.inventory.items().find(i => i.name === 'bucket');
if (bkt) await bot.equip(bkt, 'hand');

// Try bot._genericPlace
console.log('Calling bot._genericPlace on lava block...');
try {
  await bot._genericPlace(srcBlock, new Vec3(0, 1, 0), { forceLook: true });
  await sleep(1000);
} catch (e) {
  console.log('_genericPlace error:', e.message);
}

console.log('After _genericPlace, lava_bucket count:', lib.count('lava_bucket'));

// If that didn't work, let's try _genericPlace on the solid block right below or adjacent to the lava
if (lib.count('lava_bucket') === 0) {
  console.log('Trying _genericPlace on solid neighbor at (346, 39, -79)...');
  const below = bot.blockAt(new Vec3(346, 39, -79));
  if (below) {
    try {
      await bot._genericPlace(below, new Vec3(0, 1, 0), { forceLook: true });
      await sleep(1000);
    } catch (e) {
      console.log('_genericPlace below error:', e.message);
    }
  }
}

console.log('Final lava_bucket count:', lib.count('lava_bucket'));
return {
  hasLava: lib.count('lava_bucket') > 0,
  inv: lib.inv(),
  pos: bot.entity.position
};
