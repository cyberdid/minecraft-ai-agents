// programs/576-coordinate-iron-and-portal.js
console.log('=== COORDINATE WITH BETA & ALPHA ===');

bot.chat('delta: Beta: Please put your 10 raw iron in the furnace at (295, 72, -55) so we can craft buckets and reignite!');

// Check furnace at (295, 72, -55)
const fb = bot.blockAt(new Vec3(295, 72, -55));
if (fb) {
  try {
    const f = await bot.openFurnace(fb);
    console.log(`Furnace status: in=${f.inputItem()?.name} x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name} x${f.fuelItem()?.count}, out=${f.outputItem()?.name} x${f.outputItem()?.count}`);
    
    // If output is iron, take it
    if (f.outputItem() && f.outputItem().name === 'iron_ingot') {
      console.log(`Withdrawing ${f.outputItem().count} iron ingots!`);
      await f.takeOutput();
    }
    
    // If input is empty and we don't have fuel, add planks
    if (!f.fuelItem()) {
      const p = bot.inventory.items().find(i => i.name.includes('planks'));
      if (p) {
        console.log('Adding oak planks as fuel to furnace...');
        await f.putFuel(p.type, null, 2);
      }
    }
    f.close();
  } catch (e) {
    console.log('Furnace notice:', e.message);
  }
}

// Craft bucket if we have 3 iron ingots
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0) {
  try {
    await lib.craft('bucket', 1);
    console.log('Crafted bucket!');
  } catch (e) {}
}

// Craft shield if we have 1 iron ingot
if (lib.count('iron_ingot') >= 1 && lib.count('shield') === 0) {
  try {
    await lib.craft('shield', 1);
    console.log('Crafted shield!');
    const s = bot.inventory.items().find(i => i.name === 'shield');
    if (s) await bot.equip(s, 'off-hand');
  } catch (e) {}
}

// Check portal at (299, 72, -54)
const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
console.log(`Portal active: ${!!portal}`);

return {
  portal: !!portal,
  iron_ingot: lib.count('iron_ingot'),
  bucket: lib.count('bucket'),
  shield: lib.count('shield')
};
