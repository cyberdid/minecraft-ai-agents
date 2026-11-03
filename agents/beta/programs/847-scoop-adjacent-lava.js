// programs/847-scoop-adjacent-lava.js
console.log('=== Program 847: Scoop Adjacent Lava ===');
globalThis.isProgramCancelled = isCancelled;

const p = bot.entity.position;
console.log(`Current pos: ${lib.fmt(p)}`);

// Find all lava within 6m
const lavas = bot.findBlocks({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 6,
  count: 10
});

console.log(`Found ${lavas.length} lava sources within 6m:`);
for (const lp of lavas) {
  console.log(`  Lava at ${lib.fmt(lp)} (dist: ${p.distanceTo(lp).toFixed(2)}m)`);
}

if (lavas.length > 0 && lib.count('lava_bucket') === 0) {
  const target = lavas[0];
  console.log(`Targeting closest lava source: ${lib.fmt(target)}`);

  // Move slightly closer if dist > 3.5m
  if (p.distanceTo(target) > 3.5) {
    console.log('Walking closer towards target...');
    await bot.lookAt(target.offset(0.5, 1.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(400);
    bot.setControlState('forward', false);
  }

  console.log(`New pos: ${lib.fmt(bot.entity.position)}, dist to target: ${bot.entity.position.distanceTo(target).toFixed(2)}m`);

  const bkt = bot.inventory.items().find(i => i.name === 'bucket');
  if (bkt) {
    await bot.equip(bkt, 'hand');
    // Look at top face of lava block
    await bot.lookAt(target.offset(0.5, 0.9, 0.5), true);
    await sleep(200);
    bot.activateItem();
    await sleep(1000);
  }
}

console.log(`Inventory check: lava_bucket=${lib.count('lava_bucket')}, bucket=${lib.count('bucket')}`);

return {
  pos: bot.entity.position,
  lava_bucket: lib.count('lava_bucket')
};
