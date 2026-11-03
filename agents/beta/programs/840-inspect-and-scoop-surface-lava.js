// programs/840-inspect-and-scoop-surface-lava.js
console.log('=== Program 840: Inspect Surface Lava Pool at (333, 62, -78) ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

// Step out of base door
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

// Check portal sill first
const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Current portal sill at (299, 72, -54): ${sill ? sill.name : 'null'}`);

// Navigate to (330, 63, -76)
bot.chat('Beta: Moving to surface lava site (333, 62, -78) to inspect and scoop lava!');

const wps = [
  new Vec3(305, 71, -58),
  new Vec3(318, 67, -68),
  new Vec3(330, 63, -76)
];

for (const wp of wps) {
  if (checkCancelled()) break;
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 12000 });
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
    } catch (e2) {}
  }
}

console.log(`Arrived near surface pool: ${lib.fmt(bot.entity.position)}`);

// Search for any lava within 32 blocks
const lavas = bot.findBlocks({
  matching: b => b && (b.name === 'lava' || b.name === 'flowing_lava'),
  maxDistance: 32,
  count: 30
});

console.log(`Found ${lavas.length} lava blocks within 32m:`);
for (const lp of lavas) {
  const b = bot.blockAt(lp);
  console.log(`  ${lib.fmt(lp)}: ${b.name} (meta:${b.metadata}) dist=${bot.entity.position.distanceTo(lp).toFixed(1)}`);
}

// Also check obsidian nearby within 32 blocks
const obs = bot.findBlocks({
  matching: b => b && b.name === 'obsidian',
  maxDistance: 32,
  count: 20
});
console.log(`Found ${obs.length} obsidian blocks within 32m:`, obs.map(p => lib.fmt(p)));

// If lava source found, scoop it!
const sources = lavas.filter(p => bot.blockAt(p)?.metadata === 0);
if (sources.length > 0 && lib.count('lava_bucket') === 0) {
  const target = sources[0];
  console.log(`Scooping lava source at ${lib.fmt(target)}...`);
  const bkt = bot.inventory.items().find(i => i.name === 'bucket');
  if (bkt) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(target.x, target.y + 1, target.z, 2.5));
    } catch (e) {}
    await bot.equip(bkt, 'hand');
    await bot.lookAt(target.offset(0.5, 0.5, 0.5), true);
    bot.activateItem();
    await sleep(1000);
    console.log(`Lava bucket count now: ${lib.count('lava_bucket')}`);
  }
}

return {
  pos: bot.entity.position,
  lavaSources: sources.length,
  lavaBucket: lib.count('lava_bucket')
};
