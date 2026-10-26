// programs/426-craft-gold-and-scout-further-north.js
console.log('=== Step: Craft gold ingots and scout North along ridge to z=-85 ===');
console.log('Current pos in Nether:', lib.fmt(bot.entity.position));

// 1. Craft gold ingots from gold nuggets (2x2 craft)
if (lib.count('gold_nugget') >= 9) {
  try {
    const ingotRecipe = bot.recipesFor(mcData.itemsByName.gold_ingot.id, null, 1, null)[0];
    if (ingotRecipe) {
      const craftCount = Math.floor(lib.count('gold_nugget') / 9);
      await bot.craft(ingotRecipe, craftCount, null);
      console.log(`Crafted ${craftCount} gold_ingot! Gold ingots in inv: ${lib.count('gold_ingot')}`);
    }
  } catch (e) {
    console.log('Gold craft error:', e.message);
  }
}

// 2. Place a 2-high cobblestone trail marker at current location
try {
  const mPos = bot.entity.position.offset(1, 0, 0).floored();
  const mb = bot.blockAt(mPos);
  if (mb && mb.name === 'air') {
    await lib.place('cobblestone', mPos.x, mPos.y, mPos.z);
    await lib.place('cobblestone', mPos.x, mPos.y + 1, mPos.z);
    console.log(`Trail marker placed at ${lib.fmt(mPos)}`);
  }
} catch (e) {}

// 3. Scan for Nether Fortress blocks in 80m radius
const fortressBlocks = bot.findBlocks({
  matching: b => b.name.includes('nether_brick') || b.name === 'spawner' || b.name === 'nether_wart',
  maxDistance: 80,
  count: 10
});

if (fortressBlocks.length > 0) {
  console.log(`*** NETHER FORTRESS SPOTTED AT ${lib.fmt(fortressBlocks[0])}! ***`);
  bot.chat(`beta: NETHER FORTRESS CONFIRMED at ${lib.fmt(fortressBlocks[0])}!`);
} else {
  console.log('No fortress blocks in 80m view at z=-43.');
}

// 4. Advance North towards (62, 67, -65) then (62, 67, -85)
const waypoints = [
  new Vec3(62, 67, -60),
  new Vec3(62, 67, -80)
];

for (const wp of waypoints) {
  if (isCancelled()) break;
  try {
    console.log(`Advancing North to ${lib.fmt(wp)}...`);
    await lib.goTo(wp.x, wp.y, wp.z, 2);
    console.log(`Arrived near ${lib.fmt(wp)}, pos=${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Nav error to ${lib.fmt(wp)}:`, err.message);
  }

  // Scan at each new waypoint
  const fNear = bot.findBlocks({
    matching: b => b.name.includes('nether_brick') || b.name === 'spawner' || b.name === 'nether_wart',
    maxDistance: 80,
    count: 10
  });
  if (fNear.length > 0) {
    console.log(`*** NETHER FORTRESS SPOTTED AT ${lib.fmt(fNear[0])}! ***`);
    bot.chat(`beta: NETHER FORTRESS FOUND at ${lib.fmt(fNear[0])}!`);
    break;
  }
}

console.log(`North ridge advance complete. Current pos: ${lib.fmt(bot.entity.position)}, gold_ingots: ${lib.count('gold_ingot')}`);
bot.chat(`beta: North scout: reached ${lib.fmt(bot.entity.position)}. Gold ingots: ${lib.count('gold_ingot')}, HP: ${bot.health}/20, Food: ${bot.food}/20.`);
