// programs/764-inspect-team-and-portal.js
console.log('=== Program 764: Inspect Team, Furnaces & Portal Frame ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'food:', bot.food, 'HP:', bot.health);

// 1. Inspect all teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name}: pos=${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name}`);
  } else {
    console.log(`Player ${name}: entity not loaded`);
  }
}

// 2. Check all furnaces
for (const z of [-54, -55, -56]) {
  const fb = bot.blockAt(new Vec3(295, 72, z));
  if (fb && fb.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fb);
      console.log(`Furnace at z=${z}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      // If output is food or iron, take it!
      if (f.outputItem()) {
        await f.takeOutput();
      }
      f.close();
    } catch (e) {
      console.log(`Furnace z=${z} note:`, e.message);
    }
  }
}

// 3. Inspect portal frame sill at (299, 72, -54) and active portals
const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Portal sill block at (299, 72, -54): ${sill?.name}`);

const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
console.log(`Active nether_portal blocks: ${portals.length}`);

// If sill is obsidian, ignite it!
if (sill && sill.name === 'obsidian' && portals.length === 0) {
  console.log('Sill is obsidian! Striking with flint_and_steel...');
  const fas = bot.inventory.items().find(i => i.name === 'flint_and_steel');
  if (fas) {
    await bot.equip(fas, 'hand');
    await bot.activateBlock(sill, new Vec3(0, 1, 0));
    await sleep(1000);
  }
}

return {
  pos: bot.entity.position,
  food: bot.food,
  hp: bot.health,
  sill: sill?.name,
  portals: bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 }).length,
  inv: lib.inv()
};
