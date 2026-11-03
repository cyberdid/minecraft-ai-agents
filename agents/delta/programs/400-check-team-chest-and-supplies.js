// programs/400-check-team-chest-and-supplies.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Move to base chest at (293, 72, -57)
await lib.goTo(293, 72, -57, 1);

// Find all chests in base
const chestIds = [mcData.blocksByName.chest?.id, mcData.blocksByName.trapped_chest?.id, mcData.blocksByName.barrel?.id].filter(Boolean);
const chests = bot.findBlocks({ matching: chestIds, maxDistance: 8, count: 5 });

console.log(`Found ${chests.length} chests in base:`);
let totalBlazeRods = 0;
for (const cPos of chests) {
  const b = bot.blockAt(cPos);
  if (!b) continue;
  try {
    const c = await bot.openContainer(b);
    const items = c.containerItems();
    console.log(`Chest at ${lib.fmt(cPos)} has ${items.length} items:`);
    for (const item of items) {
      console.log(`  ${item.name} x${item.count}`);
      if (item.name === 'blaze_rod') totalBlazeRods += item.count;
      // Withdraw shield, iron, cooked food, weapons, armor
      if (item.name === 'shield' || item.name.includes('cooked') || item.name === 'bread' || item.name.includes('iron_') || item.name.includes('sword') || item.name.includes('pickaxe')) {
        try { await c.withdraw(item.type, null, item.count); } catch (e) {}
      }
    }
    c.close();
  } catch (e) {
    console.log(`Chest at ${lib.fmt(cPos)} open error: ${e.message}`);
  }
}

console.log(`TOTAL BLAZE RODS IN BASE CHESTS: ${totalBlazeRods}`);

// 2. Check furnaces for smelted iron or cooked food
const furnaceIds = [mcData.blocksByName.furnace?.id, mcData.blocksByName.smoker?.id, mcData.blocksByName.blast_furnace?.id].filter(Boolean);
const furnaces = bot.findBlocks({ matching: furnaceIds, maxDistance: 8, count: 5 });

for (const fPos of furnaces) {
  const b = bot.blockAt(fPos);
  if (!b) continue;
  try {
    const f = await bot.openFurnace(b);
    console.log(`Furnace at ${lib.fmt(fPos)}:`);
    console.log('  input:', f.inputItem() ? `${f.inputItem().name} x${f.inputItem().count}` : 'none');
    console.log('  fuel:', f.fuelItem() ? `${f.fuelItem().name} x${f.fuelItem().count}` : 'none');
    console.log('  output:', f.outputItem() ? `${f.outputItem().name} x${f.outputItem().count}` : 'none');
    if (f.outputItem()) await f.takeOutput();
    f.close();
  } catch (e) {
    console.log(`Furnace at ${lib.fmt(fPos)} open error: ${e.message}`);
  }
}

// 3. Equip any armor and weapons withdrawn
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('Delta inventory after base check:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
