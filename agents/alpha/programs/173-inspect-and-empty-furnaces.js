// programs/173-inspect-and-empty-furnaces.js
console.log('--- Inspecting Base Furnaces ---');

const furnaceCoords = [
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -56)
];

for (const coord of furnaceCoords) {
  const blk = bot.blockAt(coord);
  if (blk && blk.name.includes('furnace')) {
    try {
      const furn = await bot.openFurnace(blk);
      const input = furn.inputItem();
      const fuel = furn.fuelItem();
      const output = furn.outputItem();
      console.log(`Furnace at ${lib.fmt(coord)}: in=${input?.name}x${input?.count}, fuel=${fuel?.name}x${fuel?.count}, out=${output?.name}x${output?.count}`);
      
      // If there is output, take it
      if (output) {
        console.log(`Taking ${output.name}x${output.count}...`);
        await furn.takeOutput();
      }
      
      // If furnace is empty or can take raw iron
      if (!furn.inputItem() && lib.count('raw_iron') > 0) {
        const raw = bot.inventory.items().find(i => i.name === 'raw_iron');
        if (raw) {
          console.log(`Putting ${raw.count} raw iron into furnace...`);
          await furn.putInput(raw.type, null, raw.count);
        }
        const fuelItem = bot.inventory.items().find(i => i.name.endsWith('_planks') || i.name === 'stick');
        if (fuelItem && (!furn.fuelItem() || furn.fuelItem()?.count === 0)) {
          console.log(`Putting fuel into furnace...`);
          await furn.putFuel(fuelItem.type, null, fuelItem.count);
        }
      }
      furn.close();
    } catch (e) {
      console.log(`Error at ${lib.fmt(coord)}:`, e.message);
    }
  }
}

console.log('Inventory after furnace check:', JSON.stringify(lib.inv()));

// Wait for smelting if raw iron was put
if (lib.count('raw_iron') === 0 && lib.count('iron_ingot') < 3) {
  console.log('Waiting for smelting...');
  for (let i = 0; i < 30; i++) {
    if (isCancelled()) break;
    await sleep(1000);
    if (i % 6 === 0) {
      for (const coord of furnaceCoords) {
        const blk = bot.blockAt(coord);
        if (blk && blk.name.includes('furnace')) {
          try {
            const furn = await bot.openFurnace(blk);
            if (furn.outputItem()) await furn.takeOutput();
            furn.close();
          } catch {}
        }
      }
    }
    if (lib.count('iron_ingot') >= 3) break;
  }
}

console.log('Iron ingots now:', lib.count('iron_ingot'));

// Craft iron pickaxe
if (lib.count('iron_ingot') >= 3) {
  try {
    await lib.craft('iron_pickaxe', 1);
    console.log('Crafted iron_pickaxe!');
    bot.chat('alpha: Crafted iron_pickaxe! All iron tools complete.');
  } catch (e) {
    console.log('Craft pickaxe error:', e.message);
  }
}

console.log('Final inv:', JSON.stringify(lib.inv()));
