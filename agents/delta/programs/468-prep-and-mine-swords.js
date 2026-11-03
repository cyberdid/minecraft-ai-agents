// programs/468-prep-and-mine-swords.js
console.log('Delta preparing for Milestone 9 at:', lib.fmt(bot.entity.position));

// 1. Deposit junk items into base chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    for (const itemName of ['soul_sand', 'soul_soil', 'rotten_flesh', 'bone', 'arrow']) {
      const it = bot.inventory.items().find(i => i.name === itemName);
      if (it) {
        await chest.deposit(it.type, null, it.count);
        console.log(`Deposited ${it.name} x${it.count}`);
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest deposit error:', e.message);
  }
}

// 2. Go outside base door (294, 72, -54)
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

// 3. Mine 6 cobblestone for fresh swords
console.log('Mining 6 cobblestone for fresh stone swords...');
try {
  await lib.collect('cobblestone', 6);
  console.log('Cobblestone collected. Total:', lib.count('cobblestone'));
} catch (e) {
  console.log('Collect cobble error:', e.message);
}

// 4. Craft 2 stone_sword
try {
  await lib.craft('stone_sword', 2);
  console.log('Crafted stone_sword x2! Total:', lib.count('stone_sword'));
} catch (e) {
  console.log('Craft sword error:', e.message);
}

// 5. Equip best sword and offhand shield
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

bot.chat('delta: Re-armed with 2 fresh stone swords & offhand shield! Ready for Milestone 9 (12+ Ender Pearls)!');

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv(),
  held: bot.heldItem?.name,
  offhand: bot.inventory.slots[45]?.name
};
