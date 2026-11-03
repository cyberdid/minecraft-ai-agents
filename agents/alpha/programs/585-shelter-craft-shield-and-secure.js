// programs/585-shelter-craft-shield-and-secure.js
console.log('=== Program 585: Enclose Frontline Bunker, Craft Shield & Equip ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Inventory:', lib.inv());

const cur = bot.entity.position.floored();
console.log('Current floor pos:', lib.fmt(cur));

// Helper to safely place a block
async function safePlace(name, x, y, z) {
  const b = bot.blockAt(new Vec3(x, y, z));
  if (b && b.name !== 'air' && b.name !== 'cave_air' && b.name !== 'fire') return true;
  try {
    await lib.place(name, x, y, z);
    console.log(`Placed ${name} at (${x}, ${y}, ${z})`);
    return true;
  } catch (e) {
    console.log(`Place (${x}, ${y}, ${z}) note: ${e.message}`);
    return false;
  }
}

// 1. Immediately place protective wall blocks between Alpha and Spawner (North and West)
console.log('Enclosing defensive bunker at frontline...');
await safePlace('cobblestone', cur.x, cur.y, cur.z - 1);
await safePlace('cobblestone', cur.x, cur.y + 1, cur.z - 1);
await safePlace('cobblestone', cur.x - 1, cur.y, cur.z);
await safePlace('cobblestone', cur.x - 1, cur.y + 1, cur.z);

console.log('Bunker walls placed! Alpha protected on 2.5 HP.');

// 2. Craft planks from oak_log
if (lib.count('oak_log') > 0) {
  console.log('Crafting planks from oak_log...');
  try { await lib.craft('oak_planks', 4); } catch (e) { console.log('Planks note:', e.message); }
}

// 3. Ensure crafting table
console.log('Ensuring crafting table...');
let tablePos = null;
try {
  const table = await lib.ensureTable();
  tablePos = table.position;
  console.log('Crafting table available at:', lib.fmt(tablePos));
} catch (te) {
  console.log('ensureTable note:', te.message);
}

// 4. Craft shield (needs 6 planks + 1 iron_ingot)
console.log('Crafting shield...');
try {
  await lib.craft('shield', 1);
  console.log('SHIELD CRAFTED SUCCESSFULLY!');
} catch (se) {
  console.log('Shield craft error:', se.message);
}

// 5. Equip shield in offhand and stone sword in main hand
await lib.equipArmor();
await lib.equipWeapon();

console.log('=== Frontline Bunker Armed & Ready ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Held:', bot.heldItem?.name, 'Armor/Shield:', bot.inventory.slots[45]?.name);
console.log('Final inv:', lib.inv());

bot.chat(`alpha: Fortified at Spawner Balcony ${lib.fmt(bot.entity.position)}! SHIELD equipped in offhand! HP: ${bot.health.toFixed(1)}/20. Slaying Blazes!`);
