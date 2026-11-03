// programs/828-prepare-water-and-assist-portal.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 828: Prepare Water Bucket & Assist Portal Repair ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Step 1: Fill bucket with water if empty
if (lib.count('bucket') > 0 && lib.count('water_bucket') === 0) {
  console.log('Filling bucket with water...');
  try {
    const fillRes = await lib.fillBucket('water');
    console.log('Filled bucket with water:', fillRes);
    bot.chat('Beta: Filled water bucket! Standing by at portal frame to quench lava into obsidian!');
  } catch (e) {
    console.log('fillBucket notice:', e.message);
  }
}

console.log(`Water bucket in inventory: ${lib.count('water_bucket')}`);

// Step 2: Stand at (297.0, 72.0, -54.0) facing portal sill at (299, 72, -54)
try {
  await lib.goTo(297, 72, -54, 1.0, { timeoutMs: 5000 });
} catch (e) {}

console.log('Stationed at portal sill. Monitoring (299, 72, -54)...');
await bot.lookAt(new Vec3(299.5, 72.5, -54.0), true);

const checkStart = Date.now();
while (Date.now() - checkStart < 30000 && !isCancelled()) {
  const sill = bot.blockAt(new Vec3(299, 72, -54));
  const activePortals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });

  if (activePortals.length > 0) {
    console.log(`PORTAL IS ACTIVE! Found ${activePortals.length} active portal blocks!`);
    bot.chat(`Beta: NETHER PORTAL IS 100% REPAIRED AND ACTIVE (${activePortals.length} portal blocks)! Ready to warp!`);
    break;
  }

  // If lava block appeared at (299, 72, -54) and we hold water bucket, quench it!
  if (sill && sill.name === 'lava' && sill.metadata === 0 && lib.count('water_bucket') > 0) {
    console.log('Lava detected at (299, 72, -54)! Pouring water to create obsidian...');
    const wb = bot.inventory.items().find(i => i.name === 'water_bucket');
    if (wb) {
      await bot.equip(wb, 'hand');
      await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
      bot.activateItem();
      await sleep(1500);
      const bkt = bot.inventory.items().find(i => i.name === 'bucket');
      if (bkt) {
        await bot.equip(bkt, 'hand');
        bot.activateItem();
        await sleep(500);
      }
    }
  }

  await sleep(1000);
}

// Final check of portal sill
const finalSill = bot.blockAt(new Vec3(299, 72, -54));
const finalPortals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });

console.log(`Final sill block at (299, 72, -54): ${finalSill ? finalSill.name : 'null'}`);
console.log(`Final active portal blocks: ${finalPortals.length}`);

return {
  sill_block: finalSill ? finalSill.name : 'null',
  portal_active: finalPortals.length > 0,
  water_bucket: lib.count('water_bucket'),
  hp: bot.health,
  food: bot.food
};
