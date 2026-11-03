// programs/770-check-beta-and-portal.js
console.log('=== Program 770: Check Beta & Portal Status ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'food:', bot.food, 'HP:', bot.health);

for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name}: pos=${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name}`);
  } else {
    console.log(`Player ${name}: entity not loaded (offline or far away)`);
  }
}

// Check portal sill
const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Portal sill at (299, 72, -54): ${sill?.name}`);

const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
console.log(`Active portals: ${portals.length}`);

// If sill is lava, quench it!
if (sill && sill.name === 'lava') {
  console.log('Lava detected in sill! Quenching with water...');
  const wb = bot.inventory.items().find(i => i.name === 'water_bucket');
  if (wb) {
    await bot.equip(wb, 'hand');
    await bot.lookAt(new Vec3(298.5, 73.5, -54.0), true);
    bot.activateItem();
    await sleep(1500);

    const bkt = bot.inventory.items().find(i => i.name === 'bucket');
    if (bkt) await bot.equip(bkt, 'hand');
    await bot.lookAt(new Vec3(298.5, 73.5, -54.0), true);
    bot.activateItem();
    await sleep(800);
  }
}

// If sill is obsidian, strike with flint_and_steel!
const sillNow = bot.blockAt(new Vec3(299, 72, -54));
if (sillNow && sillNow.name === 'obsidian') {
  console.log('Obsidian in sill! Igniting...');
  const fas = bot.inventory.items().find(i => i.name === 'flint_and_steel');
  if (fas) {
    await bot.equip(fas, 'hand');
    await bot.activateBlock(sillNow, new Vec3(0, 1, 0));
    await sleep(1000);
  }
}

return {
  betaPos: bot.players['beta']?.entity ? lib.fmt(bot.players['beta'].entity.position) : null,
  betaHeld: bot.players['beta']?.entity?.heldItem?.name || null,
  sill: bot.blockAt(new Vec3(299, 72, -54))?.name,
  portals: bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 }).length
};
