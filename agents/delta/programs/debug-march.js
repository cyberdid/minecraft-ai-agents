globalThis.isCancelled = isCancelled;
console.log("Starting debug march...");
console.log("dim:", bot.game.dimension, "pos:", lib.fmt(bot.entity.position));
console.log("WP 0 dist:", bot.entity.position.distanceTo(new Vec3(46, 65, -7)));
console.log("WP 1 dist:", bot.entity.position.distanceTo(new Vec3(54, 65, -7)));
console.log("WP 2 dist:", bot.entity.position.distanceTo(new Vec3(63, 64, -7)));

for (let i = 0; i < globalThis.NETHER_PILLBOX_WAYPOINTS.length; i++) {
  const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
  const v = new Vec3(wp.x, wp.y, wp.z);
  const dist = bot.entity.position.distanceTo(v);
  console.log(`WP ${i} (${wp.x}, ${wp.y}, ${wp.z}) dist: ${dist.toFixed(1)}m`);
  if (dist < 3.0) {
    console.log(`  skipping WP ${i} (dist < 3.0)`);
    continue;
  }
  console.log(`  attempting lib.goTo to WP ${i}...`);
  try {
    const res = await lib.goTo(wp.x, wp.y, wp.z, 1.5, { dig: false, timeoutMs: 10000 });
    console.log(`  reached WP ${i}:`, res);
  } catch (e) {
    console.log(`  lib.goTo failed for WP ${i}:`, e.message);
    break;
  }
}
