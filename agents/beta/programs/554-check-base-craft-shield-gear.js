// programs/554-check-base-craft-shield-gear.js
console.log('=== Step: Check Base, Craft Shield, Sword, and Pickaxe ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Inspect all chests in base
const chests = bot.findBlocks({ matching: mcData.blocksByName.chest.id, maxDistance: 6, count: 5 });
console.log(`Found ${chests.length} chests in base`);
for (const cp of chests) {
  try {
    const c = await bot.openChest(bot.blockAt(cp));
    const items = c.items();
    console.log(`Chest at ${lib.fmt(cp)}:`, items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    for (const it of items) {
      if (['iron_ingot', 'raw_iron', 'shield', 'stone_pickaxe', 'iron_pickaxe', 'stone_sword', 'iron_sword', 'cobblestone', 'oak_log', 'oak_planks', 'stick', 'cooked_porkchop', 'cooked_beef', 'bread'].includes(it.name)) {
        console.log(`Withdrawing ${it.name} x${it.count}...`);
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
    console.log(`Furnace at ${lib.fmt(fp)}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
    if (f.outputItem()) {
      try { await f.takeOutput(); } catch (e) {}
    }
    await f.close();
  } catch (e) {}
}

// 3. Check inventory
console.log('Inventory after loot:', bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ') || 'empty');

// If we need wood, step outside door (294, 72, -54) and collect 3 logs
const logs = bot.inventory.items().filter(i => i.name.endsWith('_log')).reduce((a, b) => a + b.count, 0);
const planks = bot.inventory.items().filter(i => i.name.endsWith('_planks')).reduce((a, b) => a + b.count, 0);

if (logs === 0 && planks < 6) {
  console.log('Collecting logs outside...');
  try {
    await lib.goThroughDoor(294, 72, -54);
    await lib.collect('*_log', 3, 20);
  } catch (e) {
    console.log('Wood collection note:', e.message);
  }
}

// Craft planks & sticks
const totalLogs = bot.inventory.items().filter(i => i.name.endsWith('_log')).reduce((a, b) => a + b.count, 0);
if (totalLogs > 0) {
  try { await lib.craft('oak_planks', totalLogs * 4); } catch (e) {}
  try { await lib.craft('stick', 4); } catch (e) {}
}

// Craft wooden pickaxe if needed
if (!bot.inventory.items().some(i => i.name.endsWith('_pickaxe'))) {
  try { await lib.craft('wooden_pickaxe', 1); } catch (e) {}
}

// Mine cobblestone if < 16
const cobble = bot.inventory.count(mcData.itemsByName.cobblestone?.id || 0);
if (cobble < 16) {
  const wpick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
  if (wpick) await bot.equip(wpick, 'hand');
  const stones = bot.findBlocks({ matching: mcData.blocksByName.stone.id, maxDistance: 12, count: 20 });
  let m = 0;
  for (const sp of stones) {
    if (m >= 16 || isCancelled()) break;
    try { await lib.goTo(sp.x, sp.y, sp.z, 2); await lib.dig(sp.x, sp.y, sp.z); m++; } catch (e) {}
  }
  await lib.pickup(4);
}

// Craft stone pickaxe and sword
try { await lib.craft('stone_pickaxe', 1); } catch (e) {}
try { await lib.craft('stone_sword', 1); } catch (e) {}

// Craft shield if 1 iron ingot exists
if (bot.inventory.count(mcData.itemsByName.iron_ingot?.id || 0) >= 1) {
  console.log('Crafting shield with iron ingot!');
  try { await lib.craft('shield', 1); } catch (e) { console.log('Shield craft note:', e.message); }
}

// Equip armor & weapon
await lib.equipArmor();
await lib.equipWeapon();

const finalInv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Equipped Inventory:', finalInv);
bot.chat(`beta: Re-armed (${finalInv})! Ready to enter Nether portal with shield & tools.`);

return {
  inv: finalInv,
  pos: bot.entity.position,
  hp: bot.health
};
