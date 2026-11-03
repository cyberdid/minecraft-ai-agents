// programs/579-check-alpha-and-furnace.js
console.log('=== CHECK ALPHA, LAVA & FURNACE OUTPUT ===');

// Check teammates
for (const name of ['alpha', 'beta', 'gamma']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
    console.log(`  equipment:`, JSON.stringify(p.entity.equipment));
  }
}

// Check furnace at (295, 72, -55)
const fb = bot.blockAt(new Vec3(295, 72, -55));
if (fb) {
  try {
    const f = await bot.openFurnace(fb);
    console.log(`Furnace status: in=${f.inputItem()?.name} x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name} x${f.fuelItem()?.count}, out=${f.outputItem()?.name} x${f.outputItem()?.count}`);
    if (f.outputItem() && f.outputItem().name === 'iron_ingot') {
      console.log(`Taking ${f.outputItem().count} iron ingots from furnace!`);
      await f.takeOutput();
    }
    f.close();
  } catch (e) {}
}

// Convert 1 oak_log to 4 oak_planks so we have plenty of planks
if (lib.count('*_log') > 0 && lib.count('*_planks') < 6) {
  try {
    await lib.craft('oak_planks', 4);
    console.log('Crafted planks!');
  } catch (e) {}
}

// Craft shield if we got iron ingot
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1) {
  try {
    console.log('Crafting shield...');
    await lib.craft('shield', 1);
    console.log('SHIELD CRAFTED!');
    const s = bot.inventory.items().find(i => i.name === 'shield');
    if (s) await bot.equip(s, 'off-hand');
  } catch (e) {}
}

// Check portal sill block at (299, 72, -54)
const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Portal sill block at (299, 72, -54): ${sill ? sill.name : 'null'}`);

const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 10 });
console.log(`Nether portal active: ${!!portal}`);

return {
  portalActive: !!portal,
  sillBlock: sill?.name,
  shield: lib.count('shield'),
  iron_ingot: lib.count('iron_ingot')
};
