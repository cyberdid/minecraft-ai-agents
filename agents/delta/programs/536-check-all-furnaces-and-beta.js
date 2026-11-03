// programs/536-check-all-furnaces-and-beta.js
console.log('=== CHECK ALL 3 FURNACES & TEAM ===');

for (const z of [-54, -55, -56]) {
  const p = new Vec3(295, 72, z);
  const fb = bot.blockAt(p);
  if (fb && fb.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fb);
      console.log(`Furnace at (295, 72, ${z}):`);
      console.log(`  input:`, f.inputItem() ? `${f.inputItem().name} x${f.inputItem().count}` : 'empty');
      console.log(`  fuel:`, f.fuelItem() ? `${f.fuelItem().name} x${f.fuelItem().count}` : 'empty');
      console.log(`  output:`, f.outputItem() ? `${f.outputItem().name} x${f.outputItem().count}` : 'empty');
      if (f.outputItem()) {
        console.log(`  Taking output: ${f.outputItem().name} x${f.outputItem().count}`);
        await f.takeOutput();
      }
      f.close();
    } catch (e) {
      console.log(`Error reading furnace at z=${z}:`, e.message);
    }
  }
}

// Craft shield if we got iron ingot
if (lib.count('iron_ingot') >= 1) {
  try {
    await lib.craft('shield', 1);
    console.log('Crafted shield!');
    const s = bot.inventory.items().find(i => i.name === 'shield');
    if (s) await bot.equip(s, 'off-hand');
  } catch (e) {
    console.log('Craft shield error:', e.message);
  }
}

// Check where Beta, Alpha, Gamma are
for (const name of ['beta', 'alpha', 'gamma']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}`);
  } else {
    console.log(`Teammate ${name} has no entity nearby.`);
  }
}

return { inv: lib.inv(), hp: bot.health, food: bot.food };
