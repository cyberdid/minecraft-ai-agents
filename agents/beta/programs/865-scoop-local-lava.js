// programs/865-scoop-local-lava.js
console.log('=== Program 865: Inspect & Scoop Local Lava at (297, 73, -53) ===');
globalThis.isProgramCancelled = isCancelled;

const p = bot.entity.position;
console.log(`Current pos: ${lib.fmt(p)}`);

// Find all lava sources within 16m
const lavas = bot.findBlocks({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 16,
  count: 10
});

console.log(`Lava source blocks found within 16m: ${lavas.length}:`);
for (const lp of lavas) {
  console.log(`  Source at ${lib.fmt(lp)} (dist: ${p.distanceTo(lp).toFixed(2)}m)`);
}

// Find water blocks nearby
const waters = bot.findBlocks({
  matching: b => b && b.name === 'water' && b.metadata === 0,
  maxDistance: 16,
  count: 10
});
console.log(`Water source blocks found within 16m: ${waters.length}`);

// Step through door to (296, 72, -53)
console.log('Stepping through base door to (296, 72, -53)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(296, 72, -53, 1.2, { timeoutMs: 5000 }); } catch (e2) {}
}

console.log(`Pos outside door: ${lib.fmt(bot.entity.position)}`);

if (lavas.length > 0) {
  const target = lavas[0];
  console.log(`Targeting lava source at ${lib.fmt(target)}...`);
  try {
    await lib.goTo(target.x - 1, target.y, target.z, 1.5, { dig: false, timeoutMs: 4000 });
  } catch (e) {}

  const bkt = bot.inventory.items().find(i => i.name === 'bucket');
  if (bkt) {
    await bot.equip(bkt, 'hand');
    await bot.lookAt(target.offset(0.5, 0.5, 0.5), true);
    await sleep(200);
    bot.activateItem();
    await sleep(800);
  }
}

console.log(`Inventory: lava_bucket=${lib.count('lava_bucket')}, bucket=${lib.count('bucket')}`);

return {
  pos: bot.entity.position,
  lava_bucket: lib.count('lava_bucket'),
  lavas: lavas.length
};
