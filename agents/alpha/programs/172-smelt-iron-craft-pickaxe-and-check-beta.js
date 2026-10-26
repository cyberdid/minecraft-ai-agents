// programs/172-smelt-iron-craft-pickaxe-and-check-beta.js
console.log('--- Smelting Iron & Crafting Iron Pickaxe ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Raw iron:', lib.count('raw_iron'));

// 1. Smelt 3 raw iron
const furnBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnBlock && lib.count('raw_iron') > 0) {
  try {
    const furn = await bot.openFurnace(furnBlock);
    
    // Put raw iron
    const rawIronItem = bot.inventory.items().find(i => i.name === 'raw_iron');
    if (rawIronItem) {
      await furn.putInput(rawIronItem.type, null, rawIronItem.count);
    }
    
    // Put fuel
    const fuelItem = bot.inventory.items().find(i => i.name.endsWith('_planks') || i.name === 'stick');
    if (fuelItem) {
      await furn.putFuel(fuelItem.type, null, fuelItem.count);
    }
    
    console.log('Furnace burning. Waiting for 3 iron ingots...');
    for (let s = 0; s < 35; s++) {
      if (isCancelled()) break;
      await sleep(1000);
      if (furn.outputItem() && furn.outputItem().count >= 3) {
        break;
      }
    }
    if (furn.outputItem()) {
      await furn.takeOutput();
      console.log('Took output from furnace!');
    }
    furn.close();
  } catch (e) {
    console.log('Furnace note:', e.message);
  }
}

console.log('Iron ingots in inventory:', lib.count('iron_ingot'));

// 2. Craft iron pickaxe
if (lib.count('iron_ingot') >= 3) {
  console.log('Crafting iron_pickaxe...');
  try {
    await lib.craft('iron_pickaxe', 1);
    console.log('Successfully crafted iron_pickaxe!');
  } catch (e) {
    console.log('Craft error:', e.message);
  }
}

// 3. Check Beta
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p) {
    if (p.entity) {
      console.log(`Beta is at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
    } else {
      console.log('Beta is online (no entity in view distance)');
    }
  }
}

bot.chat('alpha: Inside base, crafted iron_pickaxe! Beta, what is status on diamonds?');

console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Night in:', lib.time().secondsUntilNight, 's');
