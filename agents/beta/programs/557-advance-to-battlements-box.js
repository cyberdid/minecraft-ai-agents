// programs/557-advance-to-battlements-box.js
console.log('=== Step: Advance from z=-78 to Fortress Battlements Box (z=-161) ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// Extinguish nearby fire helper
async function putOutFire() {
  const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
  const fires = bot.findBlocks({ matching: fireIds, maxDistance: 3, count: 4 });
  for (const fp of fires) {
    try { await lib.dig(fp.x, fp.y, fp.z); } catch (e) {}
  }
}

const waypoints = [
  new Vec3(54, 65, -90),
  new Vec3(44, 66, -127),
  new Vec3(44, 65, -135),
  new Vec3(44, 65, -141),
  new Vec3(44, 65, -149),
  new Vec3(44, 65, -161)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i+1}/${waypoints.length}: ${lib.fmt(wp)} (HP=${bot.health.toFixed(1)})...`);

  await putOutFire();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    console.log(`Reached WP ${i+1}: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`WP ${i+1} path note:`, err.message);
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false });
    } catch (e2) {}
  }

  // Pick up drops along the trail (especially at z=-125)
  await lib.pickup(8);

  // Equip best weapon if we picked one up
  const sword = bot.inventory.items().find(i => i.name.endsWith('_sword'));
  if (sword) await bot.equip(sword, 'hand');

  // Defend against any aggressive hostile
  const hostiles = lib.hostiles(8);
  for (const h of hostiles) {
    if (h.dist < 4 && !['zombified_piglin'].includes(h.name)) {
      console.log(`Defending against ${h.name} at dist ${h.dist.toFixed(1)}m...`);
      try { await lib.fight(4, 4); } catch (e) {}
    }
  }
}

const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Arrived at final position:', lib.fmt(bot.entity.position));
console.log('Inventory now:', inv || 'empty');
console.log('HP:', bot.health, 'Food:', bot.food);

// Check hostiles around battlements box
const nearbyHostiles = lib.hostiles(20);
console.log('Hostiles within 20m:', nearbyHostiles.map(h => `${h.name} (${h.dist.toFixed(1)}m)`).join(', ') || 'none');

if (bot.entity.position.z <= -145) {
  bot.chat(`beta: At battlements box (${lib.fmt(bot.entity.position)})! Inv: (${inv}). Ready to farm Blaze Rods at Spawner (32, 68, -190)!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  inv
};
