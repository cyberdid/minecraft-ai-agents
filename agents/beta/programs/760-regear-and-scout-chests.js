// programs/760-regear-and-scout-chests.js
console.log('=== Program 760: Regear & Scout Chests for Base Resources ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Step 1: Scan all chests within 20m of base
const chestPositions = bot.findBlocks({
  matching: b => b && (b.name === 'chest' || b.name === 'trapped_chest' || b.name === 'barrel'),
  maxDistance: 20,
  count: 10
});

console.log(`Found ${chestPositions.length} storage containers near base.`);
for (const cp of chestPositions) {
  try {
    const cb = bot.blockAt(cp);
    if (!cb) continue;
    await lib.goTo(cp.x, cp.y, cp.z, 2.0, { timeoutMs: 5000 });
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log(`Container at ${lib.fmt(cp)}:`, items.map(i => `${i.name}x${i.count}`).join(', '));

    // Withdraw food if available
    for (const item of items) {
      if (['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'bread', 'apple', 'baked_potato'].includes(item.name)) {
        console.log(`Withdrawing ${item.count} ${item.name}...`);
        await chest.withdraw(item.type, null, item.count);
      }
      // Withdraw iron armor pieces if Beta lacks them (helmet, chestplate, leggings - keep golden_boots on feet!)
      if (item.name === 'iron_helmet' && !bot.inventory.slots[5]) {
        await chest.withdraw(item.type, null, 1);
      }
      if (item.name === 'iron_chestplate' && !bot.inventory.slots[6]) {
        await chest.withdraw(item.type, null, 1);
      }
      if (item.name === 'iron_leggings' && !bot.inventory.slots[7]) {
        await chest.withdraw(item.type, null, 1);
      }
      if (item.name === 'shield' && !bot.inventory.slots[45]) {
        await chest.withdraw(item.type, null, 1);
      }
      if (item.name === 'iron_pickaxe' || item.name === 'stone_pickaxe') {
        if (lib.count('*_pickaxe') < 2) {
          await chest.withdraw(item.type, null, 1);
        }
      }
    }
    await chest.close();
  } catch (e) {
    console.log(`Error checking container at ${lib.fmt(cp)}:`, e.message);
  }
}

// Step 2: Equip armor pieces (ensuring golden_boots stays equipped)
const helmet = bot.inventory.items().find(i => i.name.includes('helmet'));
if (helmet && !bot.inventory.slots[5]) await bot.equip(helmet, 'head');
const chestplate = bot.inventory.items().find(i => i.name.includes('chestplate'));
if (chestplate && !bot.inventory.slots[6]) await bot.equip(chestplate, 'torso');
const leggings = bot.inventory.items().find(i => i.name.includes('leggings'));
if (leggings && !bot.inventory.slots[7]) await bot.equip(leggings, 'legs');

// Re-verify golden_boots on feet
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}

// Equip shield in offhand
if (bot.inventory.slots[45]?.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

// Step 3: Ensure at least 1 stone pickaxe
if (lib.count('*_pickaxe') < 2) {
  if (lib.count('cobblestone') < 6) {
    console.log('Collecting stone for pickaxes...');
    try {
      await lib.collect('stone', 8);
    } catch (e) {
      console.log('Collect stone note:', e.message);
    }
  }
  if (lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
    try {
      await lib.craft('stone_pickaxe', 1);
    } catch (e) {
      console.log('Craft pickaxe note:', e.message);
    }
  }
}

// Equip weapon
try { await lib.equipWeapon(); } catch (e) {}

console.log('=== Inventory & Equipment after Regear ===');
console.log('Armor:', {
  head: bot.inventory.slots[5]?.name,
  chest: bot.inventory.slots[6]?.name,
  legs: bot.inventory.slots[7]?.name,
  feet: bot.inventory.slots[8]?.name,
  offhand: bot.inventory.slots[45]?.name
});
console.log('Inventory:', lib.inv());

return {
  armor: {
    head: bot.inventory.slots[5]?.name,
    chest: bot.inventory.slots[6]?.name,
    legs: bot.inventory.slots[7]?.name,
    feet: bot.inventory.slots[8]?.name,
    offhand: bot.inventory.slots[45]?.name
  },
  golden_boots_equipped: bot.inventory.slots[8]?.name === 'golden_boots',
  hp: bot.health,
  food: bot.food,
  pickaxes: lib.count('*_pickaxe'),
  swords: lib.count('*_sword'),
  cobblestone: lib.count('cobblestone')
};
