// programs/548-spawner-strike-and-scout.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: PILLBOX DEFENSE & ENTITY SCAN ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Rods: ${lib.count('blaze_rod')}`);

// Equip shield in offhand if in inventory
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

// Settle into firing slit at (36.5, 66.0, -187.0)
try {
  await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -187.0, 0.4));
} catch (e) {}

// Raise shield facing spawner (32, 68, -190)
await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
bot.activateItem(true);

// Scan all entities within 32m
const nearby = Object.values(bot.entities)
  .filter(e => e !== bot.entity && bot.entity.position.distanceTo(e.position) < 32)
  .map(e => ({
    name: e.name,
    pos: lib.fmt(e.position),
    dist: bot.entity.position.distanceTo(e.position).toFixed(1)
  }));

console.log(`Entities within 32m: ${nearby.length}`);
for (const ent of nearby) {
  console.log(`  ${ent.name} at ${ent.pos} (dist: ${ent.dist})`);
}

// Check for Blazes in melee reach (<= 4.5m)
const blazes = Object.values(bot.entities).filter(e =>
  e.name === 'blaze' && e.isValid && bot.entity.position.distanceTo(e.position) <= 4.5
);

if (blazes.length > 0) {
  console.log(`Found ${blazes.length} Blaze(s) within melee reach! Striking...`);
  const target = blazes[0];
  await bot.lookAt(target.position.offset(0, target.height * 0.7, 0), true);
  bot.deactivateItem();
  await lib.equipWeapon();
  bot.attack(target);
  await sleep(650);
  bot.activateItem(true); // Re-raise shield
  await lib.pickup(3.0);
}

// Vacuum pillbox floor
try { await lib.pickup(3.0); } catch (e) {}

bot.chat(`delta: At Spawner Pillbox (36, 66, -187). HP: ${bot.health.toFixed(1)}, Rods: ${lib.count('blaze_rod')}, Cobble: ${lib.count('cobblestone')}. Defending spawner front!`);

console.log('=== STATUS ===');
console.log(`HP: ${bot.health}, Rods: ${lib.count('blaze_rod')}, Pearls: ${lib.count('ender_pearl')}`);
console.log(`Inventory:`, JSON.stringify(lib.inv()));

return {
  hp: bot.health,
  rods: lib.count('blaze_rod'),
  pearls: lib.count('ender_pearl'),
  entities: nearby.length,
  inv: lib.inv()
};
