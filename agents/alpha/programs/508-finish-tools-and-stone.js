// programs/508-finish-tools-and-stone.js
console.log('=== Program 508: Finish Tools & Stone ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));

// 1. Find nearby logs and dig 2-3
const logs = bot.findBlocks({
  matching: b => b && b.name.endsWith('_log'),
  maxDistance: 8,
  count: 4
});
console.log(`Found ${logs.length} logs nearby.`);
for (const lp of logs) {
  if (lib.count('*_log') >= 2) break;
  try {
    console.log(`Digging log at ${lib.fmt(lp)}...`);
    await lib.dig(lp.x, lp.y, lp.z);
    await lib.pickup(4);
  } catch (err) {
    console.log(`Could not dig log at ${lib.fmt(lp)}: ${err.message}`);
  }
}

// 2. Craft planks
if (lib.count('*_log') > 0) {
  const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
  if (logItem) {
    await lib.craft('birch_planks', logItem.count * 4);
  }
}
console.log('Planks count:', lib.count('*_planks'));

// 3. Craft wooden pickaxe if we don't have one
if (!lib.count('wooden_pickaxe') && !lib.count('stone_pickaxe')) {
  if (lib.count('stick') < 2) {
    await lib.craft('stick', 4);
  }
  await lib.craft('wooden_pickaxe', 1);
  console.log('Crafted wooden pickaxe!');
}

// 4. Mine 25 cobblestone from nearby stone
const stones = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'andesite' || b.name === 'diorite') && b.position.x <= 275,
  maxDistance: 16,
  count: 30
});
console.log(`Found ${stones.length} stone blocks nearby.`);
let stoneMined = 0;
for (const sp of stones) {
  if (lib.count('cobblestone') >= 25) break;
  try {
    await lib.dig(sp.x, sp.y, sp.z);
    await lib.pickup(3);
    stoneMined++;
  } catch (err) {
    // continue
  }
}
console.log(`Mined stone. Cobblestone in inventory: ${lib.count('cobblestone')}`);

// 5. Craft stone pickaxe and 2 stone swords
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

// 6. Scan for iron ore nearby
const ironOres = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 32,
  count: 5
});
console.log(`Found ${ironOres.length} iron ore blocks in 32m:`);
for (const ip of ironOres) {
  console.log(`  Iron ore at ${lib.fmt(ip)}`);
}

// 7. Equip best weapon
await lib.equipWeapon();
console.log('Final inventory:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));
