// programs/753-investigate-lava-and-scoop.js
console.log('=== Program 753: Navigate to Lava and Scoop ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

// 1. Check path to lava at (343, 39, -79)
const lavaPos = new Vec3(343, 39, -79);
console.log(`Target lava at: ${lib.fmt(lavaPos)}`);

// Can pathfinder find a route to near (343, 40, -79)?
try {
  console.log('Attempting pathfinder goto near (343, 40, -79)...');
  await bot.pathfinder.goto(new goals.GoalNear(lavaPos.x, lavaPos.y + 1, lavaPos.z, 2.0));
  console.log('Reached near lava! Current pos:', lib.fmt(bot.entity.position));
} catch (err) {
  console.log('Direct pathfinder goto failed:', err.message);
  // Check terrain from surface above (343, y, -79)
  console.log('Checking surface at (343, 64, -79)...');
  await lib.goTo(343, 64, -79, 2.0, { timeoutMs: 10000 }).catch(e => console.log('goTo surface error:', e.message));
  console.log('Surface position:', lib.fmt(bot.entity.position));
}

// Check nearby lava
const lavasNear = bot.findBlocks({
  matching: b => b && b.name.includes('lava'),
  maxDistance: 8,
  count: 5
});
console.log(`Lava blocks within 8m (${lavasNear.length}):`);
for (const lp of lavasNear) {
  const blk = bot.blockAt(lp);
  console.log(` - Lava at: ${lib.fmt(lp)}, name: ${blk.name}, above: ${bot.blockAt(lp.offset(0,1,0))?.name}`);
}

// If we are near lava, scoop it!
if (lavasNear.length > 0) {
  const target = lavasNear[0];
  console.log(`Scooping lava at ${lib.fmt(target)}...`);
  const bkt = bot.inventory.items().find(i => i.name === 'bucket');
  if (bkt) await bot.equip(bkt, 'hand');
  await bot.lookAt(target.offset(0.5, 0.8, 0.5), true);
  await sleep(200);
  bot.activateItem();
  await sleep(1000);
}

console.log('Lava bucket count:', lib.count('lava_bucket'));
return {
  hasLava: lib.count('lava_bucket') > 0,
  pos: bot.entity.position,
  inv: lib.inv()
};
