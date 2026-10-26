// programs/509-mine-stone-and-craft-gear.js
console.log('=== Program 509: Mine Stone & Craft Gear ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

// 1. Find stone blocks nearby using block IDs
const stoneIds = [
  mcData.blocksByName.stone?.id,
  mcData.blocksByName.andesite?.id,
  mcData.blocksByName.diorite?.id,
  mcData.blocksByName.granite?.id
].filter(Boolean);

const positions = bot.findBlocks({
  matching: stoneIds,
  maxDistance: 16,
  count: 40
});

console.log(`Found ${positions.length} stone positions nearby.`);
// Filter to only those on hillside (x <= 275, far from base house)
const hillStone = positions.filter(p => p.x <= 275);
console.log(`Found ${hillStone.length} stone blocks on hillside.`);

let mined = 0;
for (const pos of hillStone) {
  if (lib.count('cobblestone') >= 25) break;
  try {
    await lib.dig(pos.x, pos.y, pos.z);
    await lib.pickup(3);
    mined++;
  } catch (err) {
    // continue
  }
}
console.log(`Mined ${mined} stone. Cobblestone in inventory: ${lib.count('cobblestone')}`);

// 2. Craft stone tools: stone pickaxe, 2 stone swords
if (lib.count('cobblestone') >= 3 && !lib.count('stone_pickaxe')) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  await lib.craft('stone_pickaxe', 1);
  console.log('Crafted stone pickaxe!');
}

if (lib.count('cobblestone') >= 4 && lib.count('stone_sword') < 2) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  await lib.craft('stone_sword', 2);
  console.log('Crafted 2 stone swords!');
}

// 3. Scan for iron ore within 32m
const ironIds = [
  mcData.blocksByName.iron_ore?.id,
  mcData.blocksByName.deepslate_iron_ore?.id
].filter(Boolean);

const ironPositions = bot.findBlocks({
  matching: ironIds,
  maxDistance: 32,
  count: 5
});
console.log(`Found ${ironPositions.length} iron ores in 32m.`);
for (const ip of ironPositions) {
  console.log(`  Iron ore at ${lib.fmt(ip)}`);
  if (lib.count('stone_pickaxe')) {
    try {
      console.log(`Mining iron ore at ${lib.fmt(ip)}...`);
      await lib.dig(ip.x, ip.y, ip.z);
      await lib.pickup(3);
    } catch (err) {
      console.log(`Failed to mine iron: ${err.message}`);
    }
  }
}

// 4. Equip best weapon
await lib.equipWeapon();
console.log('Inventory summary:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));
console.log('Tools:', JSON.stringify(lib.tools()));
