// programs/755-dig-stone-and-scoop-lava.js
console.log('=== Program 755: Dig Stone Cover and Scoop Lava Source ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

const srcPos = new Vec3(346, 40, -79);
console.log(`Lava source position: ${lib.fmt(srcPos)}`);

// 1. Clear stone blocks above lava source: (346, 42, -79) and (346, 41, -79)
for (const y of [42, 41]) {
  const p = new Vec3(srcPos.x, y, srcPos.z);
  const blk = bot.blockAt(p);
  console.log(`Block at ${lib.fmt(p)}: ${blk?.name}`);
  if (blk && blk.name !== 'air' && blk.name !== 'cave_air') {
    console.log(`Digging block at ${lib.fmt(p)}...`);
    try {
      await lib.dig(p.x, p.y, p.z);
    } catch (e) {
      console.log(`Dig error at ${lib.fmt(p)}:`, e.message);
    }
  }
}

// Check block above lava source now
const aboveNow = bot.blockAt(srcPos.offset(0, 1, 0));
console.log(`Block above lava source is now: ${aboveNow?.name}`);

// 2. Position Alpha securely on solid ground overlooking the lava source
// Solid neighbor: (345, 41, -79) or (346, 41, -78)
console.log('Moving to position adjacent to lava source...');
try {
  await bot.pathfinder.goto(new goals.GoalLookAtBlock(srcPos, bot.world, { reach: 3.5 }));
} catch (e) {
  try {
    await lib.goTo(345, 41, -78, 1.5, { timeoutMs: 5000 });
  } catch (e2) {}
}

console.log('Current Alpha position:', lib.fmt(bot.entity.position));

// 3. Equip bucket and scoop lava source
const bkt = bot.inventory.items().find(i => i.name === 'bucket');
if (bkt) await bot.equip(bkt, 'hand');

// Look directly down at the surface of the exposed lava source
await bot.lookAt(srcPos.offset(0.5, 0.85, 0.5), true);
await sleep(250);

// Use item
console.log('Scooping lava source...');
bot.activateItem();
await sleep(1000);

console.log('Lava bucket count after scoop attempt 1:', lib.count('lava_bucket'));

// If not scooped, try clicking directly on the block interface
if (lib.count('lava_bucket') === 0) {
  console.log('Attempt 2: targeting lava block directly with activateBlock...');
  const lavaBlock = bot.blockAt(srcPos);
  if (lavaBlock) {
    try {
      await bot.activateBlock(lavaBlock, new Vec3(0, 1, 0));
      await sleep(800);
    } catch (e) {
      console.log('activateBlock on lava note:', e.message);
    }
  }
}

console.log('Lava bucket count after scoop attempt 2:', lib.count('lava_bucket'));

// Attempt 3: lib.fillBucket('lava') now that air is above it!
if (lib.count('lava_bucket') === 0) {
  console.log('Attempt 3: lib.fillBucket("lava")...');
  try {
    const res = await lib.fillBucket('lava');
    console.log('lib.fillBucket result:', res);
  } catch (e) {
    console.log('lib.fillBucket error:', e.message);
  }
}

const hasLava = lib.count('lava_bucket') > 0;
console.log(`*** Final Lava Bucket Status: ${hasLava ? 'SUCCESS' : 'FAILED'} ***`);

if (hasLava) {
  bot.chat('alpha: LAVA BUCKET SECURED! Ascending to portal frame (299, 72, -54) to cast obsidian!');
}

return {
  hasLava,
  pos: bot.entity.position,
  inv: lib.inv()
};
