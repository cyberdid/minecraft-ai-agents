// programs/773-inspect-sill-and-cast.js
console.log('=== Program 773: Inspect Sill & Quench/Ignite ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Current block at sill (299, 72, -54): ${sill?.name}`);

const south = bot.blockAt(new Vec3(299, 72, -53));
console.log(`Current block at south (299, 72, -53): ${south?.name}`);

const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
console.log(`Active portals: ${portals.length}`);

// If sill is lava: quench!
if (sill && (sill.name === 'lava' || sill.name.includes('lava'))) {
  console.log('Lava detected in sill! Pouring water bucket...');
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

// Check sill again
const sillAfter = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Block at sill after quench check: ${sillAfter?.name}`);

// If sill is obsidian: ignite!
if (sillAfter && sillAfter.name === 'obsidian') {
  console.log('Obsidian verified in sill! Striking with flint_and_steel...');
  const fas = bot.inventory.items().find(i => i.name === 'flint_and_steel');
  if (fas) {
    await bot.equip(fas, 'hand');
    await bot.activateBlock(sillAfter, new Vec3(0, 1, 0));
    await sleep(1200);
  }
}

// Final check of portals
const portalsAfter = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
console.log(`Portals after strike: ${portalsAfter.length}`);

if (portalsAfter.length > 0) {
  bot.chat(`alpha: NETHER PORTAL ACTIVE! ${portalsAfter.length} portal blocks verified! Milestone 7 RESTORED!`);
  console.log('Entering Nether Portal...');
  const res = await enterNetherPortal(20000);
  console.log('Transit result:', JSON.stringify(res));
}

return {
  sill: bot.blockAt(new Vec3(299, 72, -54))?.name,
  portals: bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 }).length,
  pos: bot.entity.position,
  dim: bot.game.dimension
};
