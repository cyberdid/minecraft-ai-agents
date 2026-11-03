// programs/382-mine-stone-and-craft-sword.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Equip stone pickaxe
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// 2. Locate stone blocks outside base (x >= 301 or z < -60)
const stoneId = mcData.blocksByName.stone?.id;
const stonePositions = bot.findBlocks({
  matching: stoneId,
  maxDistance: 24,
  count: 20
});

console.log(`Found ${stonePositions.length} stone blocks.`);
let minedCount = 0;
for (const p of stonePositions) {
  if (lib.count('cobblestone') >= 6) break;
  // Safety: strictly outside base structure (base is x=292..296, z=-58..-54, y=71..76)
  if (p.x < 300 && p.z >= -60 && p.z <= -50) continue;
  
  const b = bot.blockAt(p);
  if (!b || !bot.canDigBlock(b)) continue;
  
  console.log(`Moving near stone at ${lib.fmt(p)}...`);
  try {
    await lib.goTo(p.x, p.y + 1, p.z, 2, { timeoutMs: 6000 });
  } catch (e) {
    // If pathfinder fails, try direct look and reach
  }
  
  if (bot.entity.position.distanceTo(p) < 4.5) {
    console.log(`Digging stone at ${lib.fmt(p)}...`);
    try {
      await bot.dig(b);
      minedCount++;
      await lib.pickup(4);
    } catch (e) {
      console.log(`Dig note: ${e.message}`);
    }
  }
}

console.log(`Mined ${minedCount} stone. Cobblestone in inventory: ${lib.count('cobblestone')}`);

// 3. Return to base crafting table at (295, 72, -56)
console.log('Returning to crafting table at (295, 72, -56)...');
try {
  await lib.goTo(294, 72, -56, 1.5, { timeoutMs: 8000 });
} catch (e) {
  console.log('Crafting table move note:', e.message);
}

// 4. Ensure planks and sticks
if (lib.count('stick') < 2) {
  const log = bot.inventory.items().find(i => i.name.endsWith('_log'));
  if (log) {
    try { await lib.craft(log.name.replace('_log', '_planks'), 4); } catch (e) {}
  }
  try { await lib.craft('stick', 4); } catch (e) {}
}

// 5. Craft stone sword
if (lib.count('cobblestone') >= 2) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('SUCCESS: Stone sword crafted!');
  } catch (e) {
    console.log(`Craft stone_sword error: ${e.message}`);
  }
}

// Equip weapon
try {
  await lib.equipWeapon();
  console.log('Equipped weapon:', bot.heldItem?.name);
} catch (e) {}

console.log('Final inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
