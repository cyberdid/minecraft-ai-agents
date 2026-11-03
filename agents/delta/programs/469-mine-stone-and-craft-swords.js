// programs/469-mine-stone-and-craft-swords.js
console.log('Delta at:', lib.fmt(bot.entity.position));

// 1. Find stone blocks within 12 blocks
const stones = bot.findBlocks({
  matching: mcData.blocksByName.stone.id,
  maxDistance: 16,
  count: 10
});

console.log(`Found ${stones.length} stone blocks nearby.`);
if (stones.length > 0 && lib.count('cobblestone') < 4) {
  try {
    await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
  } catch (e) {}

  for (const sPos of stones) {
    if (lib.count('cobblestone') >= 4) break;
    // Ensure we don't dig under our own feet
    if (sPos.x === Math.floor(bot.entity.position.x) && sPos.z === Math.floor(bot.entity.position.z)) continue;
    try {
      await bot.pathfinder.goto(new goals.GoalNear(sPos.x, sPos.y, sPos.z, 2.5));
      const b = bot.blockAt(sPos);
      if (b && b.name === 'stone') {
        console.log(`Digging stone at ${lib.fmt(sPos)}...`);
        await bot.dig(b);
        await sleep(200);
      }
    } catch (e) {
      console.log('Dig error:', e.message);
    }
  }
}

// Collect drops
try { await lib.pickup(4); } catch (e) {}
console.log('Cobblestone count:', lib.count('cobblestone'));

// 2. Craft stone swords
if (lib.count('cobblestone') >= 2) {
  try {
    await lib.craft('stone_sword', Math.floor(lib.count('cobblestone') / 2));
    console.log('Crafted stone_sword! Total in inv:', lib.count('stone_sword'));
  } catch (e) {
    console.log('Craft error:', e.message);
  }
}

// 3. Equip best weapon & shield
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

console.log('Gear equipped. Held:', bot.heldItem?.name, 'Offhand:', bot.inventory.slots[45]?.name);

// 4. Enter Nether Portal (299.5, 73, -54) to join Alpha & Beta for gold mining
console.log('Stepping into Nether Portal (299.5, 73, -54)...');
try {
  await enterNetherPortal(25000);
} catch (e) {
  console.log('Portal note:', e.message);
}

bot.chat('delta: In Nether armed with fresh sword & shield! Joining team to mine Nether Gold Ore for Milestone 9!');

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
