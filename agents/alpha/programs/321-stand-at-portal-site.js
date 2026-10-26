// programs/321-stand-at-portal-site.js
console.log('=== Program 321: Stand by at Portal Site ===');

// Walk out to portal site
console.log('Walking out to portal site (298, 72, -52)...');
try {
  await lib.goThroughDoor(294, 72, -54);
  await lib.goTo(298, 72, -52, 1);
  console.log('At portal site! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Go to portal note:', e.message);
}

// Watch portal frame and Delta's arrival for 20 seconds
for (let i = 0; i < 10; i++) {
  if (isCancelled()) break;
  
  // Check Delta
  const d = bot.players.delta?.entity;
  if (d) {
    console.log(`[t=${i*2}s] Delta at ${lib.fmt(d.position)}, held=${d.heldItem?.name}`);
  }
  
  // Try building the frame (placing any available pieces)
  const frame = lib.shapes.portal(298, 72, -54, 'x');
  const mat = lib.materials(frame);
  if (mat.need.cobblestone || mat.need.obsidian) {
    console.log(`[t=${i*2}s] Frame needs: ${JSON.stringify(mat.need)}, missing: ${JSON.stringify(mat.missing)}`);
    try {
      await lib.build(frame, { replace: false });
    } catch (e) {}
  }
  
  // Check if lit
  const inside1 = bot.blockAt(new Vec3(299, 73, -54));
  const inside2 = bot.blockAt(new Vec3(300, 73, -54));
  if (inside1?.name === 'nether_portal' || inside2?.name === 'nether_portal') {
    console.log('NETHER PORTAL IS LIT!!! MILESTONE 7 COMPLETE!');
    break;
  }
  
  await sleep(2000);
}
