// programs/856-find-source-and-scoop.js
console.log('=== Program 856: Find True Lava Source (meta 0) & Scoop ===');
globalThis.isProgramCancelled = isCancelled;

const p = bot.entity.position;
console.log(`Beta pos: ${lib.fmt(p)}`);

// Find all lava sources with metadata === 0
const sources = bot.findBlocks({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 16,
  count: 30
});

console.log(`Found ${sources.length} true lava sources within 16m:`);
for (const sp of sources) {
  const up = bot.blockAt(sp.offset(0, 1, 0));
  console.log(`  Source at ${lib.fmt(sp)}: above=${up ? up.name : 'null'}, dist=${p.distanceTo(sp).toFixed(2)}m`);
}

// Find closest source that has air or cave_air above it
const walkableSources = sources.filter(sp => {
  const up = bot.blockAt(sp.offset(0, 1, 0));
  return up && (up.name === 'air' || up.name === 'cave_air');
});

console.log(`Found ${walkableSources.length} sources with open air above!`);

if (walkableSources.length > 0) {
  const target = walkableSources[0];
  console.log(`Targeting source at ${lib.fmt(target)}...`);
  
  // Find safe solid block adjacent to target to stand on
  let safeStand = null;
  for (const [dx, dz] of [[1,0], [-1,0], [0,1], [0,-1], [1,1], [-1,-1], [1,-1], [-1,1]]) {
    const checkPos = target.offset(dx, 1, dz);
    const floor = target.offset(dx, 0, dz);
    const cb = bot.blockAt(checkPos);
    const fb = bot.blockAt(floor);
    if (fb && fb.boundingBox === 'block' && fb.name !== 'lava' && cb && (cb.name === 'air' || cb.name === 'cave_air')) {
      safeStand = checkPos;
      break;
    }
  }

  if (safeStand) {
    console.log(`Walking to safe stand pos ${lib.fmt(safeStand)}...`);
    try {
      await bot.pathfinder.goto(new goals.GoalBlock(safeStand.x, safeStand.y, safeStand.z));
    } catch (e) {}
  }

  // Equip bucket and scoop
  const bkt = bot.inventory.items().find(i => i.name === 'bucket');
  if (bkt) {
    await bot.equip(bkt, 'hand');
    await bot.lookAt(target.offset(0.5, 0.8, 0.5), true);
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
