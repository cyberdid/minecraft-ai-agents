// programs/832-scoop-surface-lava.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 832: Scoop Surface Lava Pool ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Walk right up to the edge of the lava pool at (332, 63, -77)
const lavaLedge = new Vec3(332, 63, -77);
console.log('Navigating to lava pool ledge at (332, 63, -77)...');
try {
  await lib.goTo(lavaLedge.x, lavaLedge.y, lavaLedge.z, 1.5, { timeoutMs: 12000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(lavaLedge.x, lavaLedge.y, lavaLedge.z, 1.2)); } catch (e2) {}
}

console.log('At ledge pos:', lib.fmt(bot.entity.position));

// 2. Scan for lava source blocks
const lavaBlocks = bot.findBlocks({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 8,
  count: 10
});
console.log(`Found ${lavaBlocks.length} lava source blocks:`, lavaBlocks.map(p => lib.fmt(p)).join(', '));

// 3. Scoop lava with empty bucket
if (lavaBlocks.length > 0 && lib.count('bucket') > 0) {
  const target = lavaBlocks[0];
  console.log(`Scooping lava source at ${lib.fmt(target)}...`);
  const bkt = bot.inventory.items().find(i => i.name === 'bucket');
  if (bkt) {
    await bot.equip(bkt, 'hand');
    await bot.lookAt(target.offset(0.5, 0.5, 0.5), true);
    bot.activateItem();
    await sleep(1500);
  }
}

console.log(`Lava bucket in inventory now: ${lib.count('lava_bucket')}`);

// 4. Return to portal frame at (297, 72, -54)
if (lib.count('lava_bucket') > 0) {
  bot.chat('Beta: Successfully scooped lava bucket! Returning to portal frame (299, 72, -54) to cast obsidian!');
  try {
    await lib.goTo(297, 72, -54, 1.2, { timeoutMs: 12000 });
  } catch (e) {}

  console.log('At portal frame:', lib.fmt(bot.entity.position));

  // Place lava into sill at (299, 72, -54)
  const sillPos = new Vec3(299, 72, -54);
  const curSill = bot.blockAt(sillPos);
  if (curSill && curSill.name === 'air') {
    console.log('Placing lava into sill basin...');
    const lb = bot.inventory.items().find(i => i.name === 'lava_bucket');
    if (lb) {
      await bot.equip(lb, 'hand');
      await bot.lookAt(new Vec3(299.5, 71.8, -54.0), true);
      bot.activateItem();
      await sleep(1000);
    }
  }

  // Quench with water bucket
  const sillAfterLava = bot.blockAt(sillPos);
  if (sillAfterLava && sillAfterLava.name.includes('lava')) {
    console.log('Quenching lava with water bucket...');
    const wb = bot.inventory.items().find(i => i.name === 'water_bucket');
    if (wb) {
      await bot.equip(wb, 'hand');
      await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
      bot.activateItem();
      await sleep(1200);

      const emptyB = bot.inventory.items().find(i => i.name === 'bucket');
      if (emptyB) {
        await bot.equip(emptyB, 'hand');
        await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
        bot.activateItem();
        await sleep(600);
      }
    }
  }

  const finalSill = bot.blockAt(sillPos);
  console.log('Final sill block:', finalSill ? finalSill.name : 'null');
  if (finalSill && finalSill.name === 'obsidian') {
    bot.chat('Beta: 100% COMPLETE! Obsidian sill cast at (299, 72, -54)! Relighting portal!');
  }
}

return {
  lava_bucket: lib.count('lava_bucket'),
  sill_block: bot.blockAt(new Vec3(299, 72, -54))?.name
};
