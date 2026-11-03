// programs/843-scan-lava-from-mid-shaft.js
console.log('=== Program 843: Scan Lava from Mid-Shaft ===');
globalThis.isProgramCancelled = isCancelled;

bot.clearControlStates();
bot.pathfinder.stop();

const shaftWps = [
  new Vec3(302, 69, -43),
  new Vec3(301, 63, -45),
  new Vec3(302, 57, -47),
  new Vec3(302, 54, -43),
  new Vec3(303, 51, -41),
  new Vec3(302, 48, -39),
  new Vec3(301, 45, -39)
];

for (let i = 0; i < shaftWps.length; i++) {
  if (isCancelled()) break;
  const wp = shaftWps[i];
  console.log(`Stepping to shaft WP ${i + 1}/${shaftWps.length}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.5, { timeoutMs: 6000 });
  } catch (e) {
    console.log(`WP ${i + 1} note: ${e.message}`);
  }
}

console.log(`Current pos: ${lib.fmt(bot.entity.position)}`);

// Scan for all lava within 48 blocks
const lavas = bot.findBlocks({
  matching: b => b && (b.name === 'lava' || b.name === 'flowing_lava'),
  maxDistance: 48,
  count: 50
});

console.log(`Found ${lavas.length} lava blocks within 48m from ${lib.fmt(bot.entity.position)}:`);
const sources = [];
for (const lp of lavas) {
  const b = bot.blockAt(lp);
  if (b && b.metadata === 0) sources.push(lp);
}
console.log(`Found ${sources.length} lava SOURCES:`);
for (const sp of sources.slice(0, 10)) {
  console.log(`  Source at ${lib.fmt(sp)} (dist: ${bot.entity.position.distanceTo(sp).toFixed(1)}m)`);
}

// Also check obsidian
const obs = bot.findBlocks({
  matching: b => b && b.name === 'obsidian',
  maxDistance: 48,
  count: 20
});
console.log(`Found ${obs.length} obsidian blocks within 48m:`, obs.map(o => lib.fmt(o)));

return {
  pos: bot.entity.position,
  lavaSources: sources.length,
  nearestSource: sources[0] ? lib.fmt(sources[0]) : null,
  obsidian: obs.length
};
