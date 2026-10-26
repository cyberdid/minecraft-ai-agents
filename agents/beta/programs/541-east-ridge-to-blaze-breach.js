// programs/541-east-ridge-to-blaze-breach.js
console.log('=== Step: East Ridge March to Mountain Breach (44, 65, -149) & Blaze Tunnel ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// Equip stone sword
const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
if (sword) await bot.equip(sword, 'hand');

// Function to extinguish nearby fire
async function putOutFire() {
  const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
  const fires = bot.findBlocks({ matching: fireIds, maxDistance: 4, count: 5 });
  for (const fp of fires) {
    try { await lib.dig(fp.x, fp.y, fp.z); } catch (e) {}
  }
}

// Delta's proven safe East Ridge waypoints
const waypoints = [
  new Vec3(63, 66, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(54, 65, -90),
  new Vec3(44, 66, -127),
  new Vec3(44, 65, -135),
  new Vec3(44, 65, -141),
  new Vec3(44, 65, -149)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i+1}/${waypoints.length}: ${lib.fmt(wp)} (HP=${bot.health.toFixed(1)})...`);
  
  await putOutFire();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    console.log(`Reached WP ${i+1}: ${lib.fmt(bot.entity.position)} (HP=${bot.health.toFixed(1)})`);
  } catch (err) {
    console.log(`WP ${i+1} note: ${err.message}, attempting lib.goTo...`);
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false });
    } catch (e2) {
      console.log(`lib.goTo WP ${i+1} failed:`, e2.message);
    }
  }

  // Defend against any nearby hostile (except neutral zombified piglins)
  const hostiles = lib.hostiles(10);
  for (const h of hostiles) {
    if (h.dist < 4 && !['zombified_piglin'].includes(h.name)) {
      console.log(`Defending against ${h.name} at dist ${h.dist.toFixed(1)}m...`);
      try { await lib.fight(4, 4); } catch (e) {}
    }
  }
}

console.log('Arrived at fortress advance section! Pos:', lib.fmt(bot.entity.position));

// If reached z <= -140, enter mountain breach at (44, 65, -149)
if (bot.entity.position.z <= -140) {
  bot.chat(`beta: Reached mountain breach at ${lib.fmt(bot.entity.position)}! Carrying 50 cobble, stone pickaxe, and sword. Tunneling to Blaze Spawner (32, 68, -190)!`);
  
  // Equip stone pickaxe
  const pick = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
  if (pick) await bot.equip(pick, 'hand');

  // Tunnel through mountain towards (32, 68, -188)
  console.log('Beginning mountain tunneling towards Blaze Spawner...');
  
  // Target coordinates step-by-step
  // We want to dig 1x2 tunnel forward along -Z and -X
  let curX = Math.round(bot.entity.position.x);
  let curY = Math.round(bot.entity.position.y);
  let curZ = Math.round(bot.entity.position.z);
  
  for (let step = 0; step < 25; step++) {
    if (isCancelled()) break;
    if (curZ <= -185) {
      console.log(`Within 5m of Blaze Spawner balcony! Stopping tunnel at z=${curZ}`);
      break;
    }
    
    // Step forward along -Z, and gradually shift -X towards 32
    curZ -= 1;
    if (curX > 32 && step % 3 === 0) curX -= 1;
    if (curY < 68 && step % 8 === 0) curY += 1;

    console.log(`Digging tunnel step ${step+1} to (${curX}, ${curY}, ${curZ})...`);
    
    // Dig feet (curY) and head (curY+1)
    const feetBlock = bot.blockAt(new Vec3(curX, curY, curZ));
    const headBlock = bot.blockAt(new Vec3(curX, curY + 1, curZ));
    
    if (feetBlock && feetBlock.boundingBox === 'block') {
      try { await lib.dig(curX, curY, curZ); } catch (e) {}
    }
    if (headBlock && headBlock.boundingBox === 'block') {
      try { await lib.dig(curX, curY + 1, curZ); } catch (e) {}
    }

    // Step forward into the dug tunnel
    try {
      await bot.pathfinder.goto(new goals.GoalBlock(curX, curY, curZ));
    } catch (e) {}
  }
}

console.log('Final position:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);
bot.chat(`beta: At ${lib.fmt(bot.entity.position)} in mountain tunnel! HP=${bot.health.toFixed(1)}, Cobble=${lib.count('cobblestone')}`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  cobble: lib.count('cobblestone')
};
