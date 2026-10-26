// programs/519-craft-pick-mine-cobble-sword.js
console.log('=== Step: Craft Stone Pickaxe, Mine Cobblestone, Craft Stone Sword ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Current inventory:', bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', '));

// 1. Craft stone pickaxe
console.log('Crafting stone_pickaxe...');
try {
  await lib.craft('stone_pickaxe', 1);
  console.log('Successfully crafted stone_pickaxe!');
} catch (e) {
  console.log('Failed to craft stone_pickaxe directly:', e.message);
  // Ensure we have crafting table
  if (!bot.inventory.items().some(i => i.name === 'crafting_table')) {
    try { await lib.craft('crafting_table', 1); } catch (e2) {}
  }
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted stone_pickaxe after placing/finding table!');
  } catch (e3) {
    console.log('Still failed stone_pickaxe:', e3.message);
  }
}

// Equip best pickaxe
const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
if (pick) {
  await bot.equip(pick, 'hand');
  console.log(`Equipped ${pick.name}`);
}

// 2. Mine cobblestone (we want at least 24 cobblestone)
const cobbleNeeded = 24 - (bot.inventory.count(mcData.itemsByName.cobblestone.id) || 0);
console.log(`Cobblestone needed: ${cobbleNeeded}`);
if (cobbleNeeded > 0) {
  try {
    await lib.collect('cobblestone', cobbleNeeded, 25);
    console.log('Collected cobblestone! Total now:', bot.inventory.count(mcData.itemsByName.cobblestone.id));
  } catch (e) {
    console.log('Error in lib.collect cobblestone:', e.message);
    // Manual dig
    const stones = bot.findBlocks({ matching: mcData.blocksByName.stone.id, maxDistance: 15, count: 10 });
    for (const sp of stones) {
      if (bot.inventory.count(mcData.itemsByName.cobblestone.id) >= 24) break;
      try {
        await lib.goTo(sp.x, sp.y, sp.z, 2);
        await lib.dig(sp.x, sp.y, sp.z);
      } catch (e2) {}
    }
  }
}

// 3. Craft stone sword
console.log('Crafting stone_sword...');
try {
  await lib.craft('stone_sword', 1);
  console.log('Successfully crafted stone_sword!');
} catch (e) {
  console.log('Stone sword craft note:', e.message);
}

// 4. Report inventory & surroundings
const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Final Inventory:', inv);
console.log('Pos:', lib.fmt(bot.entity.position), 'Night in:', bot.time.timeOfDay);

return inv;
