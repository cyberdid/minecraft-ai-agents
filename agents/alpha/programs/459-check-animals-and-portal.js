// programs/459-check-animals-and-portal.js
console.log('=== Program 459: Check Surroundings ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check all entities within 64m
const mobs = [];
for (const e of Object.values(bot.entities)) {
  if (['cow', 'pig', 'sheep', 'chicken'].includes(e.name)) {
    mobs.push({ name: e.name, pos: lib.fmt(e.position), dist: e.position.distanceTo(bot.entity.position).toFixed(1) });
  }
}
console.log(`Animals found (${mobs.length}):`, JSON.stringify(mobs));

// 2. Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
}

// 3. Check base portal
const portalBlocks = bot.findBlocks({
  matching: mcData.blocksByName.nether_portal?.id,
  maxDistance: 16,
  count: 10
});
console.log(`Portal blocks found: ${portalBlocks.length}`);
