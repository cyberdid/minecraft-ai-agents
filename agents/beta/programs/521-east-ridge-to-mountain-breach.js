// programs/521-east-ridge-to-mountain-breach.js
console.log('=== Step: Navigate East Ridge to Fortress Advance Tunnel & Mountain Breach ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Helper to extinguish fire around bot
async function putOutNearbyFire() {
  const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
  const fires = bot.findBlocks({ matching: fireIds, maxDistance: 5, count: 8 });
  for (const fp of fires) {
    try {
      console.log(`Putting out fire at ${lib.fmt(fp)}...`);
      await lib.dig(fp.x, fp.y, fp.z);
    } catch (e) {}
  }
}

// 1. Step East (+X) out of the Nether portal bunker
console.log('Stepping East out of portal bunker...');
await putOutNearbyFire();
try {
  await lib.goTo(46, 65, -7, 1.0);
} catch (e) {
  await bot.lookAt(new Vec3(46, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.clearControlStates();
}

console.log('Outside bunker at:', lib.fmt(bot.entity.position));

// 2. Safe East Ridge Waypoints
const waypoints = [
  new Vec3(55, 65, -7),
  new Vec3(61, 68, -3),
  new Vec3(61, 67, -43),
  new Vec3(61, 66, -85),
  new Vec3(50, 65, -115),
  new Vec3(45, 65, -127),
  new Vec3(44, 65, -141)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i+1}/${waypoints.length}: ${lib.fmt(wp)} (HP=${bot.health.toFixed(1)})...`);
  
  await putOutNearbyFire();
  
  // Equip stone sword in hand for defense
  const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
  if (sword) await bot.equip(sword, 'hand');
  
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2.0);
    console.log(`Reached WP ${i+1} at: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`goTo WP ${i+1} note (${err.message}), trying walkTo...`);
    try {
      await lib.walkTo(wp.x, wp.z);
      console.log(`walkTo WP ${i+1} reached: ${lib.fmt(bot.entity.position)}`);
    } catch (err2) {
      console.log(`walkTo WP ${i+1} failed: ${err2.message}`);
    }
  }
}

console.log('Advance completed! Current pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);

// 3. Inspect surroundings and teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== 'beta') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m, HP=${p.entity.health || '?'})`);
  }
}

// Check nearby hostiles
const hostiles = lib.hostiles(16);
console.log('Hostiles within 16m:', hostiles.map(h => `${h.name} at ${lib.fmt(h.pos)} (${h.dist.toFixed(1)}m)`).join(', ') || 'none');

// Report in chat
bot.chat(`beta: At ${lib.fmt(bot.entity.position)} in advance tunnel! Armed with stone sword & pickaxe + 17 cobble. Ready to tunnel to Blaze Spawner (32, 68, -190)!`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  inventory: bot.inventory.items().map(i => `${i.name}x${i.count}`)
};
