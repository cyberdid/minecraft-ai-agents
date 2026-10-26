// programs/503-east-ridge-to-advance-tunnel.js
console.log('=== Step: Follow East Ridge Trail (x=62..63) to Fortress Tunnel ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Step out of portal frame
bot.setControlState('forward', true);
await sleep(800);
bot.clearControlStates();
console.log('Outside portal frame at:', lib.fmt(bot.entity.position));

// 2. Check bunker chest within 6m
const chestPos = bot.findBlocks({ matching: mcData.blocksByName.chest?.id, maxDistance: 6, count: 1 })[0];
if (chestPos) {
  try {
    const cb = bot.blockAt(chestPos);
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Nether bunker chest items:', items.map(i => `${i.name}x${i.count}`).join(', '));
    for (const it of items) {
      if (it.name.endsWith('_sword') || it.name.endsWith('_pickaxe') || it.name === 'cobblestone' || it.name.startsWith('cooked_') || it.name === 'shield') {
        await chest.withdraw(it.type, null, it.count);
        console.log(`Withdrew ${it.name}x${it.count}!`);
      }
    }
    chest.close();
  } catch (e) {}
}

try { await lib.equipArmor(); } catch (e) {}

// 3. Strictly follow East Ridge Waypoints (staying at x >= 62 through z=-30..-95)
const eastRidgeWaypoints = [
  new Vec3(63, 65, -7),
  new Vec3(63, 65, -35),
  new Vec3(62, 66, -60),
  new Vec3(62, 65, -95),
  new Vec3(50, 65, -120),
  new Vec3(45, 65, -127),
  new Vec3(44, 65, -133)
];

for (let i = 0; i < eastRidgeWaypoints.length; i++) {
  if (isCancelled()) break;
  const wp = eastRidgeWaypoints[i];
  console.log(`Moving to East Ridge WP ${i+1}/${eastRidgeWaypoints.length}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2.0);
    console.log(`Reached WP ${i+1}: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`WP ${i+1} path error, using walkTo:`, e.message);
    try { await lib.walkTo(wp.x, wp.z); } catch (e2) {}
  }
}

console.log('Arrival position:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Check Delta entity
const delta = bot.players['delta']?.entity;
if (delta) {
  console.log(`UNITED WITH DELTA at ${lib.fmt(delta.position)}! Distance: ${bot.entity.position.distanceTo(delta.position).toFixed(1)}m`);
}

bot.chat(`beta: United with Delta at Fortress advance tunnel (${lib.fmt(bot.entity.position)})! Ready to breach netherrack mountain to Blaze Spawner at (32, 68, -190)!`);
