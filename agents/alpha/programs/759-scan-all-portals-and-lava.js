// programs/759-scan-all-portals-and-lava.js
console.log('=== Program 759: Scan All Portals & Lava Lakes ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Scan for any nether_portal blocks up to 128m
const portalId = mcData.blocksByName.nether_portal?.id;
const allPortals = bot.findBlocks({
  matching: portalId,
  maxDistance: 128,
  count: 20
});

console.log(`ALL nether_portal blocks in world (${allPortals.length}):`);
for (const p of allPortals) {
  console.log(` - Portal at: ${lib.fmt(p)}`);
}

// 2. Scan for lava near (286, 18, 8)
const lavaLakePos = new Vec3(286, 18, 8);
console.log(`Distance to Massive Lava Lake (286, 18, 8): ${bot.entity.position.distanceTo(lavaLakePos).toFixed(1)}m`);

// 3. Scan for ALL lava blocks in 128m
const lavaId = mcData.blocksByName.lava.id;
const allLavas = bot.findBlocks({
  matching: lavaId,
  maxDistance: 128,
  count: 500
});

console.log(`Total lava blocks within 128m: ${allLavas.length}`);
let sources128 = 0;
const sourcePositions = [];
for (const lp of allLavas) {
  const b = bot.blockAt(lp);
  const props = b.getProperties();
  if (props.level === '0' || props.level === 0 || (!props.level && b.metadata === 0)) {
    sources128++;
    sourcePositions.push(lp);
  }
}
console.log(`Total lava SOURCES (level 0) within 128m: ${sources128}`);
for (const sp of sourcePositions.slice(0, 10)) {
  console.log(` - Source at: ${lib.fmt(sp)}, above: ${bot.blockAt(sp.offset(0,1,0))?.name}, dist: ${bot.entity.position.distanceTo(sp).toFixed(1)}m`);
}

// 4. Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== bot.username) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} holding: ${p.entity.heldItem?.name}`);
  }
}

return {
  portals: allPortals.length,
  sources: sources128,
  nearestSource: sourcePositions[0] || null
};
