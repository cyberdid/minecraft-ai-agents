// programs/863-complete-portal-now.js
console.log('=== Program 863: Complete Portal Repair Immediately ===');
globalThis.isProgramCancelled = isCancelled;

const sillPos = new Vec3(299, 72, -54);
const curSill = bot.blockAt(sillPos);
console.log(`Current sill block at (299, 72, -54): ${curSill ? curSill.name : 'null'}`);
console.log(`Beta held: ${bot.heldItem ? bot.heldItem.name : 'empty'}, pos: ${lib.fmt(bot.entity.position)}`);

// If Beta still has lava_bucket and sill is air, place it!
if (curSill && curSill.name === 'air' && lib.count('lava_bucket') > 0) {
  console.log('Placing lava into sill at (299, 72, -54)...');
  const lb = bot.inventory.items().find(i => i.name === 'lava_bucket');
  if (lb) {
    await bot.equip(lb, 'hand');
    await bot.lookAt(new Vec3(299.5, 72.1, -54.0), true);
    bot.activateItem();
    await sleep(1000);
    bot.chat('Beta: Placed lava into sill (299, 72, -54)!');
  }
}

// Check sill again
await sleep(500);
const sillNow = bot.blockAt(sillPos);
console.log(`Sill after place check: ${sillNow ? sillNow.name : 'null'}`);

// If sill is lava or flowing_lava, quench with water!
if (sillNow && (sillNow.name === 'lava' || sillNow.name === 'flowing_lava') && lib.count('water_bucket') > 0) {
  console.log('Quenching lava with water_bucket...');
  const wb = bot.inventory.items().find(i => i.name === 'water_bucket');
  if (wb) {
    await bot.equip(wb, 'hand');
    await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
    bot.activateItem();
    await sleep(1200);

    // Scoop water back immediately with empty bucket
    const eb = bot.inventory.items().find(i => i.name === 'bucket');
    if (eb) {
      await bot.equip(eb, 'hand');
      await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
      bot.activateItem();
      await sleep(800);
    }
  }
}

// Check final sill block
const finalSill = bot.blockAt(sillPos);
console.log(`Final sill block at (299, 72, -54): ${finalSill ? finalSill.name : 'null'}`);

if (finalSill && finalSill.name === 'obsidian') {
  bot.chat('Beta: OBSIDIAN SILL COMPLETE! Frame 100% restored! Delta / Alpha ignite with flint & steel!');
}

// Check if nether_portal blocks appear
let portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
console.log(`Nether portal blocks found: ${portals.length}`);

// If not lit yet, wait 3 seconds and check again
if (portals.length === 0) {
  await sleep(3000);
  portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
  console.log(`Nether portal blocks after wait: ${portals.length}`);
}

return {
  sill: finalSill ? finalSill.name : 'null',
  nether_portal_blocks: portals.length
};
