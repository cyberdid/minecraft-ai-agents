// programs/396-check-nether-position.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// Check surrounding blocks
const bFeet = bot.blockAt(bot.entity.position.floored());
const bBelow = bot.blockAt(bot.entity.position.floored().offset(0, -1, 0));
console.log('Feet block:', bFeet?.name, 'Below block:', bBelow?.name);

// Find portal blocks within 10m
const portalBlocks = bot.findBlocks({
  matching: mcData.blocksByName.nether_portal?.id,
  maxDistance: 10,
  count: 10
});
console.log(`Found ${portalBlocks.length} nether_portal blocks nearby.`);

// Check distance to confirmed Nether points
const bunker = new Vec3(40, 65, -7);
const spawner = new Vec3(32, 68, -190);
console.log(`Distance to bunker (40, 65, -7): ${bot.entity.position.distanceTo(bunker).toFixed(1)}m`);
console.log(`Distance to Spawner (32, 68, -190): ${bot.entity.position.distanceTo(spawner).toFixed(1)}m`);

// Check nearby hostiles
const hostiles = lib.hostiles(20);
console.log(`Hostiles within 20m (${hostiles.length}):`);
for (const h of hostiles) {
  console.log(`  ${h.name} at dist ${h.dist.toFixed(1)}m`);
}
