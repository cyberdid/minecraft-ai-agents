// programs/328-mine-stone-loadout.js
console.log('=== MINE STONE LOADOUT ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Equip wooden pickaxe
const wp = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
if (wp) await bot.equip(wp, 'hand');

// 2. Mine 3 stone for stone pickaxe
const stones = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'andesite' || b.name === 'diorite'),
  maxDistance: 6,
  count: 35
});
console.log(`Found ${stones.length} stone blocks in reach.`);

for (const p of stones) {
  if (lib.count('cobblestone') >= 3 || isCancelled()) break;
  const b = bot.blockAt(p);
  if (b) {
    try {
      await bot.lookAt(p.offset(0.5, 0.5, 0.5));
      await bot.dig(b);
    } catch (e) {}
  }
}
await sleep(200);
await lib.pickup(5);
console.log('Cobblestone for pickaxe:', lib.count('cobblestone'));

// 3. Craft stone pickaxe
if (lib.count('cobblestone') >= 3) {
  console.log('Crafting stone_pickaxe...');
  await lib.craft('stone_pickaxe', 1);
}
const sp = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (sp) await bot.equip(sp, 'hand');

// 4. Mine 2 stone for stone sword
for (const p of stones) {
  if (lib.count('cobblestone') >= 2 || isCancelled()) break;
  const b = bot.blockAt(p);
  if (b) {
    try {
      await bot.lookAt(p.offset(0.5, 0.5, 0.5));
      await bot.dig(b);
    } catch (e) {}
  }
}
await sleep(200);
await lib.pickup(5);

// 5. Craft stone sword
if (lib.count('cobblestone') >= 2) {
  console.log('Crafting stone_sword...');
  await lib.craft('stone_sword', 1);
  await lib.equipWeapon();
}

// 6. Mine remaining stone with fast stone pickaxe up to 35 cobble
if (sp) await bot.equip(sp, 'hand');
const moreStones = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'andesite' || b.name === 'diorite'),
  maxDistance: 8,
  count: 45
});

for (const p of moreStones) {
  if (lib.count('cobblestone') >= 35 || isCancelled()) break;
  const b = bot.blockAt(p);
  if (b) {
    try {
      await bot.lookAt(p.offset(0.5, 0.5, 0.5));
      await bot.dig(b);
    } catch (e) {}
  }
}
await sleep(250);
await lib.pickup(6);

console.log('\n=== STATUS AT END ===');
console.log('Cobblestone:', lib.count('cobblestone'));
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma equipped with stone_sword, stone_pickaxe, and ${lib.count('cobblestone')} cobblestone! Ready for Nether transit!`);
