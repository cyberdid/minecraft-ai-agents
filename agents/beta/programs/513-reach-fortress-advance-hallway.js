// programs/513-reach-fortress-advance-hallway.js
console.log('=== Step: Craft Pickaxe & March to Fortress Advance Hallway ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Craft wooden_pickaxe in Nether bunker
if (lib.count('wooden_pickaxe') === 0 && lib.count('crafting_table') > 0 && lib.count('birch_planks') >= 3 && lib.count('stick') >= 2) {
  const spot = await lib.freeSpot();
  if (spot) {
    await lib.place('crafting_table', spot.x, spot.y, spot.z);
    const tb = bot.blockAt(spot);
    if (tb) {
      const wpRecipe = bot.recipesFor(mcData.itemsByName.wooden_pickaxe.id, null, 1, tb)[0];
      if (wpRecipe) {
        await bot.craft(wpRecipe, 1, tb);
        console.log('Crafted wooden_pickaxe in Nether bunker!');
      }
      await lib.dig(spot.x, spot.y, spot.z);
      await lib.pickup(3);
    }
  }
}

console.log('Tools:', JSON.stringify(lib.tools()), 'Inv:', JSON.stringify(lib.inv()));

// Helper: Extinguish fire
async function extinguishNearbyFire(range = 5) {
  const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
  const fires = bot.findBlocks({ matching: fireIds, maxDistance: range, count: 10 });
  for (const fp of fires) {
    try {
      console.log(`Extinguishing fire at ${lib.fmt(fp)}...`);
      await lib.dig(fp.x, fp.y, fp.z);
    } catch (e) {}
  }
}

// 2. High Ridge Waypoints strictly along x=44..54 (solid ground at y=64..66)
const ridgeWaypoints = [
  new Vec3(48, 65, -7),
  new Vec3(54, 65, -35),
  new Vec3(53, 64, -67),
  new Vec3(49, 65, -95),
  new Vec3(45, 65, -125),
  new Vec3(44, 65, -133)
];

for (let i = 0; i < ridgeWaypoints.length; i++) {
  if (isCancelled()) break;
  const wp = ridgeWaypoints[i];
  console.log(`Advancing to Ridge WP ${i+1}/${ridgeWaypoints.length}: ${lib.fmt(wp)} (HP=${bot.health.toFixed(1)})...`);
  
  await extinguishNearbyFire(5);
  
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2.0);
    console.log(`Reached WP ${i+1}: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`WP ${i+1} path error, using walkTo:`, e.message);
    try { await lib.walkTo(wp.x, wp.z); } catch (e2) {}
  }
  
  await extinguishNearbyFire(5);
}

console.log('Final position:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== 'beta') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

bot.chat(`beta: At Fortress advance hallway (${lib.fmt(bot.entity.position)})! United with team. Ready to breach Blaze Spawner at (32, 68, -190)!`);
