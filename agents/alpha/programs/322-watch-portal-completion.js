// programs/322-watch-portal-completion.js
console.log('=== Program 322: Watch Portal Completion ===');

for (let i = 0; i < 10; i++) {
  if (isCancelled()) break;
  
  for (const name of ['delta', 'beta', 'gamma']) {
    const p = bot.players[name]?.entity;
    if (p) {
      console.log(`[t=${i*2}s] ${name} at ${lib.fmt(p.position)}, held=${p.heldItem?.name}`);
    }
  }
  
  // Check portal frame
  const frame = lib.shapes.portal(298, 72, -54, 'x');
  const mat = lib.materials(frame);
  console.log(`[t=${i*2}s] Portal need: ${JSON.stringify(mat.need)}, missing: ${JSON.stringify(mat.missing)}`);
  
  // Try to place any blocks if possible
  if (mat.need.cobblestone > 0 && lib.count('cobblestone') > 0) {
    try {
      await lib.build(frame, { replace: false });
    } catch (e) {}
  }
  
  // Check if lit
  const inside1 = bot.blockAt(new Vec3(299, 73, -54));
  const inside2 = bot.blockAt(new Vec3(300, 73, -54));
  if (inside1?.name === 'nether_portal' || inside2?.name === 'nether_portal') {
    console.log('NETHER PORTAL IS LIT!!! SUCCESS!!!');
    break;
  }
  
  await sleep(2000);
}
