// programs/547-scout-and-unite-with-alpha.js
console.log('=== Step: Scout Surroundings & Unite with Alpha at Nether Camp ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Scan nearby blocks and entities
const p = bot.entity.position.floored();
console.log(`Current block underfoot: ${bot.blockAt(p.offset(0, -1, 0))?.name}, at feet: ${bot.blockAt(p)?.name}`);

// Check nearby item drops
const drops = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 25);
console.log(`Found ${drops.length} item drops within 25m:`);
for (const d of drops) {
  console.log(`  Drop at ${lib.fmt(d.position)} (dist ${bot.entity.position.distanceTo(d.position).toFixed(1)}m)`);
  try { await lib.goTo(d.position.x, d.position.y, d.position.z, 0.5); } catch (e) {}
}

// Check nearby portals
const portals = bot.findBlocks({ matching: mcData.blocksByName.nether_portal?.id, maxDistance: 30, count: 5 });
console.log(`Found ${portals.length} nether_portal blocks nearby:`, portals.map(pt => lib.fmt(pt)));

// Check teammate positions
for (const [name, player] of Object.entries(bot.players)) {
  if (player.entity && name !== 'beta') {
    const d = bot.entity.position.distanceTo(player.entity.position);
    console.log(`Player ${name} visible at ${lib.fmt(player.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

// 2. Extinguish any nearby fire
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
const fires = bot.findBlocks({ matching: fireIds, maxDistance: 4, count: 5 });
for (const fp of fires) {
  try { await lib.dig(fp.x, fp.y, fp.z); } catch (e) {}
}

// 3. Move West towards East Ridge entrance (63, 65, -5) and Nether Camp (40, 65, -7)
const target = new Vec3(63, 65, -5);
console.log(`Moving towards East Ridge trail entrance at ${lib.fmt(target)}...`);

try {
  await bot.pathfinder.goto(new goals.GoalNear(target.x, target.y, target.z, 3));
  console.log(`Reached East Ridge entrance: ${lib.fmt(bot.entity.position)}`);
} catch (e) {
  console.log('Pathfinder error towards target:', e.message);
  // Try stage waypoint
  try {
    const midWp = new Vec3(90, 62, -15);
    await bot.pathfinder.goto(new goals.GoalNear(midWp.x, midWp.y, midWp.z, 3));
    await bot.pathfinder.goto(new goals.GoalNear(target.x, target.y, target.z, 3));
  } catch (e2) {
    console.log('Stage waypoint error:', e2.message);
  }
}

console.log('Current Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);
bot.chat(`beta: At ${lib.fmt(bot.entity.position)} in Nether! Joining Alpha at (${lib.fmt(target)}).`);

return {
  pos: bot.entity.position,
  dimension: bot.game.dimension,
  hp: bot.health,
  inventory: bot.inventory.items().map(i => `${i.name}x${i.count}`)
};
