// programs/174-fuel-furnace-craft-iron-pickaxe.js
console.log('--- Fueling Furnace and Crafting Iron Pickaxe ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Iron ingots:', lib.count('iron_ingot'));

const furnBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnBlock) {
  try {
    const furn = await bot.openFurnace(furnBlock);
    console.log(`Furnace status: in=${furn.inputItem()?.name}x${furn.inputItem()?.count}, fuel=${furn.fuelItem()?.name}x${furn.fuelItem()?.count}, out=${furn.outputItem()?.name}x${furn.outputItem()?.count}`);
    
    // Put fuel (birch planks)
    const planks = bot.inventory.items().find(i => i.name.endsWith('_planks'));
    if (planks && (!furn.fuelItem() || furn.fuelItem()?.count === 0)) {
      console.log(`Putting ${planks.count} planks into fuel...`);
      await furn.putFuel(planks.type, null, planks.count);
    }
    
    // Wait for the 2 raw iron to smelt (~20s)
    console.log('Waiting for smelting...');
    for (let s = 0; s < 25; s++) {
      if (isCancelled()) break;
      await sleep(1000);
      if (furn.outputItem() && furn.outputItem().count >= 2) break;
    }
    
    if (furn.outputItem()) {
      console.log(`Taking ${furn.outputItem().name}x${furn.outputItem().count}...`);
      await furn.takeOutput();
    }
    furn.close();
  } catch (e) {
    console.log('Furnace error:', e.message);
  }
}

console.log('Total iron ingots in inventory:', lib.count('iron_ingot'));

// Craft iron pickaxe
if (lib.count('iron_ingot') >= 3) {
  console.log('Crafting iron_pickaxe...');
  try {
    if (lib.count('stick') < 2) {
      await lib.craft('stick', 4);
    }
    await lib.craft('iron_pickaxe', 1);
    console.log('Crafted iron_pickaxe!');
    bot.chat('alpha: Crafted iron_pickaxe! All iron tools ready. Beta, craft diamond_pickaxe and let us get obsidian!');
  } catch (e) {
    console.log('Craft error:', e.message);
  }
}

// Check Beta
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p && p.entity) {
    console.log(`Beta at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
  }
}

console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Night in:', lib.time().secondsUntilNight, 's');
