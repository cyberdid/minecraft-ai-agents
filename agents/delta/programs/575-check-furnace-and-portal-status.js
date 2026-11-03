// programs/575-check-furnace-and-portal-status.js
console.log('=== DELTA: CHECK FURNACE & PORTAL STATUS ===');

// Step 1: Check furnace at (295, 72, -55)
const fb = bot.blockAt(new Vec3(295, 72, -55));
if (fb) {
  try {
    const f = await bot.openFurnace(fb);
    console.log(`Furnace: input=${f.inputItem()?.name} x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name} x${f.fuelItem()?.count}, output=${f.outputItem()?.name} x${f.outputItem()?.count}`);
    if (f.outputItem() && f.outputItem().name === 'iron_ingot') {
      console.log(`Withdrawing ${f.outputItem().count} iron ingots from furnace!`);
      await f.takeOutput();
    }
    f.close();
  } catch (e) {
    console.log('Furnace notice:', e.message);
  }
}

// Step 2: Craft shield if we have iron ingot and planks
console.log(`Iron ingots: ${lib.count('iron_ingot')}, Planks: ${lib.count('*_planks')}`);
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1) {
  try {
    console.log('Crafting shield at base crafting table (295, 72, -56)...');
    await lib.craft('shield', 1);
    console.log('SHIELD CRAFTED!');
    const s = bot.inventory.items().find(i => i.name === 'shield');
    if (s) await bot.equip(s, 'off-hand');
  } catch (e) {
    console.log('Craft shield notice:', e.message);
  }
}

// Step 3: Check portal sill at (299, 72, -54)
const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Portal sill block at (299, 72, -54): ${sill ? sill.name : 'null'}`);

// Step 4: Check if nether_portal block exists
const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
console.log(`Nether portal status: ${portal ? 'ACTIVE at ' + lib.fmt(portal.position) : 'INACTIVE'}`);

// Step 5: Check teammates
for (const name of ['alpha', 'beta', 'gamma']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
    console.log(`  Equipment:`, JSON.stringify(p.entity.equipment));
  }
}

bot.chat(`delta: Dawn status — HP: ${bot.health.toFixed(1)}, Food: ${bot.food}, Shield: ${lib.count('shield') > 0 ? 'YES' : 'NO'}, Portal: ${portal ? 'LIT' : 'UNLIT'}`);

return {
  portalActive: !!portal,
  sillBlock: sill?.name,
  shield: lib.count('shield'),
  iron_ingots: lib.count('iron_ingot')
};
