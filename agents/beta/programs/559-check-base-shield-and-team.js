// programs/559-check-base-shield-and-team.js
console.log('=== Step: Check Base for Shield / Iron & Players ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Inspect all chests in base
const chests = bot.findBlocks({ matching: mcData.blocksByName.chest.id, maxDistance: 6, count: 5 });
for (const cp of chests) {
  try {
    const c = await bot.openChest(bot.blockAt(cp));
    const items = c.items();
    console.log(`Chest at ${lib.fmt(cp)}:`, items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    for (const it of items) {
      if (['shield', 'iron_ingot', 'raw_iron', 'stone_pickaxe', 'iron_pickaxe', 'stone_sword', 'iron_sword', 'cobblestone', 'cooked_porkchop', 'bread'].includes(it.name)) {
        console.log(`Taking ${it.name} x${it.count}...`);
        try { await c.withdraw(it.type, null, it.count); } catch (e) {}
      }
    }
    await c.close();
  } catch (e) {}
}

// 2. Inspect all furnaces in base
const furnaceIds = [mcData.blocksByName.furnace.id, mcData.blocksByName.lit_furnace?.id].filter(Boolean);
const furnaces = bot.findBlocks({ matching: furnaceIds, maxDistance: 6, count: 4 });
for (const fp of furnaces) {
  try {
    const f = await bot.openFurnace(bot.blockAt(fp));
    console.log(`Furnace at ${lib.fmt(fp)}: in=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, out=${f.outputItem()?.name}x${f.outputItem()?.count}`);
    if (f.outputItem()) {
      try { await f.takeOutput(); } catch (e) {}
    }
    await f.close();
  } catch (e) {}
}

// 3. Check players in range
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== 'beta') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m, held=${p.entity.heldItem?.name || 'none'})`);
  }
}

// 4. Report inventory
console.log('Beta inv:', bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
