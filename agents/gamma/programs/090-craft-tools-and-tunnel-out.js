// programs/090-craft-tools-and-tunnel-out.js
console.log('--- CRAFTING TOOLS IN TUNNEL & STAIRCASE UP ---');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Craft crafting table in 2x2 grid
console.log('Crafting crafting_table...');
await lib.craft('crafting_table', 1);
console.log('Crafting table crafted! Inv:', JSON.stringify(lib.inv()));

// 2. Place crafting table at (316, 48, -34)
console.log('Placing crafting table at (316, 48, -34)...');
await lib.place('crafting_table', 316, 48, -34);

// 3. Craft wooden_pickaxe at the placed table
console.log('Crafting wooden_pickaxe at table...');
await lib.craft('wooden_pickaxe', 1);
console.log('Wooden pickaxe crafted!');

// 4. Mine 12 stone blocks around us
const stoneTargets = [
  new Vec3(314, 48, -34),
  new Vec3(315, 48, -35),
  new Vec3(314, 48, -33),
  new Vec3(314, 48, -35),
  new Vec3(314, 49, -34),
  new Vec3(315, 49, -35),
  new Vec3(314, 49, -33),
  new Vec3(314, 47, -34),
  new Vec3(315, 47, -35),
  new Vec3(314, 47, -33),
  new Vec3(316, 47, -35),
  new Vec3(316, 47, -33)
];

await bot.equip(mcData.itemsByName.wooden_pickaxe.id, 'hand');
for (const sp of stoneTargets) {
  if (lib.count('cobblestone') >= 12) break;
  const b = bot.blockAt(sp);
  if (b && (b.name === 'stone' || b.name === 'cobblestone' || b.name === 'diorite' || b.name === 'granite')) {
    try {
      console.log(`Mining ${b.name} at ${lib.fmt(sp)}...`);
      await lib.dig(sp.x, sp.y, sp.z);
      await sleep(200);
      await lib.pickup(4);
    } catch (e) {
      console.log('Dig note:', e.message);
    }
  }
}

console.log('Cobblestone collected:', lib.count('cobblestone'));

// 5. Craft stone tools at table
console.log('Crafting stone tools at table...');
if (lib.count('cobblestone') >= 2) {
  await lib.craft('stone_sword', 1);
}
if (lib.count('cobblestone') >= 3) {
  await lib.craft('stone_pickaxe', 1);
}
if (lib.count('cobblestone') >= 3) {
  await lib.craft('stone_axe', 1);
}

// 6. Mine the crafting table back into inventory
await lib.dig(316, 48, -34);
await lib.pickup(4);

console.log('Tools now:', JSON.stringify(lib.tools()));
console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat(`gamma armed with stone tools! Digging staircase up to surface base at (294, 72, -54).`);
