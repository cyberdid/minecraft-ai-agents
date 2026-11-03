console.log('=== DELTA: GOTO SPAWN PORTAL (46, 66, 2) ===');
console.log(`Delta Pos: ${lib.fmt(bot.entity.position)}`);

configureFireAvoidance();

// Move towards (46, 66, 0)
const target = new Vec3(46.5, 66.0, 0.0);
console.log(`Moving to portal front at ${lib.fmt(target)}...`);

try {
  await bot.pathfinder.goto(new goals.GoalNear(target.x, target.y, target.z, 1.0));
} catch (e) {
  console.log('Goto error:', e.message);
  try {
    await lib.goToXZ(target.x, target.z, { timeoutMs: 10000 });
  } catch (e2) {
    console.log('lib.goToXZ error:', e2.message);
  }
}

console.log(`Current Pos: ${lib.fmt(bot.entity.position)}`);

// Find portal blocks within 5m
const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 6,
  count: 10
});

console.log(`Portal blocks found within 6m: ${portals.length}`);
for (const p of portals) {
  console.log(`  Portal: ${lib.fmt(p)}`);
}

return {
  pos: bot.entity.position,
  portals: portals.map(p => ({ x: p.x, y: p.y, z: p.z }))
};
