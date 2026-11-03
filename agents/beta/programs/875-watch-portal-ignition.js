// programs/875-watch-portal-ignition.js
console.log('=== Program 875: Watch Alpha Ascent & Portal Ignition ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

// Stand at (297.5, 72.0, -53.5) facing portal frame
bot.clearControlStates();
bot.pathfinder.stop();

try {
  await lib.goTo(297.5, 72.0, -53.5, 0.5, { timeoutMs: 4000 });
} catch (e) {}

await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);

const start = Date.now();
let lastSill = null;

while (Date.now() - start < 35000 && !checkCancelled()) {
  const sill = bot.blockAt(new Vec3(299, 72, -54));
  const sillName = sill ? sill.name : 'null';

  if (sillName !== lastSill) {
    console.log(`[${Math.round((Date.now() - start)/1000)}s] Sill block changed: ${sillName}`);
    lastSill = sillName;
  }

  // Check portal blocks
  const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
  if (portals.length > 0) {
    console.log(`SUCCESS! Nether portal ignited with ${portals.length} active portal blocks!`);
    bot.chat('Beta: PORTAL IS LIT! Nether transit ready for Milestone 9!');
    break;
  }

  // Check Alpha entity
  const alpha = bot.players['alpha']?.entity;
  if (alpha) {
    console.log(`Alpha visible: pos=${lib.fmt(alpha.position)}, held=${alpha.heldItem ? alpha.heldItem.name : 'empty'}`);
  }

  await sleep(1500);
}

const finalPortals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
console.log(`Final check: active portal blocks = ${finalPortals.length}`);

return {
  portals: finalPortals.length,
  sill: bot.blockAt(new Vec3(299, 72, -54))?.name
};
