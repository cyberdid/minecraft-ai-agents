// programs/784-quench-and-light-now.js
console.log('=== Program 784: Quench Lava and Light Portal NOW ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Inspect all blocks around (299, 72, -54)
for (let dy = 0; dy <= 2; dy++) {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      const p = new Vec3(299 + dx, 72 + dy, -54 + dz);
      const b = bot.blockAt(p);
      if (b && (b.name === 'lava' || b.name === 'obsidian' || b.name === 'water' || b.name === 'nether_portal')) {
        console.log(`Special block at ${lib.fmt(p)}: ${b.name}`);
      }
    }
  }
}

const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Block at (299, 72, -54): ${sill?.name}`);

// 2. If lava is anywhere near the sill, pour water!
const lavaNear = bot.findBlocks({ matching: mcData.blocksByName.lava.id, maxDistance: 4, count: 5 });
console.log(`Lava blocks within 4m: ${lavaNear.length}`, lavaNear.map(p => lib.fmt(p)));

if (lavaNear.length > 0) {
  console.log('POURING WATER TO QUENCH LAVA...');
  bot.chat('alpha: Quenching lava into obsidian now!');
  const wb = bot.inventory.items().find(i => i.name === 'water_bucket');
  if (wb) {
    await bot.equip(wb, 'hand');
    // Pour against (298, 73, -54)
    await bot.lookAt(new Vec3(298.5, 73.5, -54.0), true);
    bot.activateItem();
    await sleep(1500);

    // Scoop water back up
    const bkt = bot.inventory.items().find(i => i.name === 'bucket');
    if (bkt) await bot.equip(bkt, 'hand');
    await bot.lookAt(new Vec3(298.5, 73.5, -54.0), true);
    bot.activateItem();
    await sleep(800);
  }
}

// 3. Check sill block now
const sillAfter = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Block at (299, 72, -54) after quench: ${sillAfter?.name}`);

// 4. If obsidian, ignite!
const fas = bot.inventory.items().find(i => i.name === 'flint_and_steel');
if (sillAfter && sillAfter.name === 'obsidian') {
  console.log('OBSIDIAN IN SILL! STRIKING FLINT AND STEEL...');
  bot.chat('alpha: Striking obsidian sill with flint and steel to ignite portal!');
  if (fas) {
    await bot.equip(fas, 'hand');
    await bot.activateBlock(sillAfter, new Vec3(0, 1, 0));
    await sleep(1200);
  }
}

// 5. Check if portal active
let portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
console.log(`Active nether_portal blocks: ${portals.length}`);

if (portals.length === 0 && fas) {
  // Try striking (300, 72, -54)
  const sill300 = bot.blockAt(new Vec3(300, 72, -54));
  if (sill300 && sill300.name === 'obsidian') {
    console.log('Striking (300, 72, -54)...');
    await bot.equip(fas, 'hand');
    await bot.activateBlock(sill300, new Vec3(0, 1, 0));
    await sleep(1000);
  }
  portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
  console.log(`Active nether_portal blocks after second strike: ${portals.length}`);
}

// 6. If portal active, WARP!
if (portals.length > 0) {
  bot.chat(`alpha: NETHER PORTAL FULLY RESTORED & LIT (${portals.length} blocks)! Milestone 7 RESTORED! Entering Nether!`);
  console.log('Entering Nether Portal now...');
  const res = await enterNetherPortal(25000);
  console.log('Transit result:', JSON.stringify(res));
  if (bot.game.dimension === 'the_nether') {
    bot.chat('alpha: In the Nether! Advancing to Fortress Bunker for Milestone 9!');
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  sill: bot.blockAt(new Vec3(299, 72, -54))?.name,
  portals: bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 }).length,
  inv: lib.inv()
};
