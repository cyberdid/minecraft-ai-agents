// programs/491-mine-cobble-and-craft-stone-tools.js
console.log('=== Step: Mine Immediate Cobble & Craft Stone Tools ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Equip wooden_pickaxe
await bot.equip(mcData.itemsByName.wooden_pickaxe.id, 'hand');

// 2. Scan for cobblestone blocks within 4m
const cobbles = bot.findBlocks({
  matching: mcData.blocksByName.cobblestone.id,
  maxDistance: 4,
  count: 6
});
console.log(`Found ${cobbles.length} cobblestone blocks within 4m`);

for (const cp of cobbles) {
  if (lib.count('cobblestone') >= 5) break;
  // Don't mine the block under crafting table or furnaces
  if (cp.equals(new Vec3(295, 71, -56)) || cp.equals(new Vec3(295, 71, -55))) continue;
  try {
    console.log(`Mining cobblestone at ${lib.fmt(cp)}...`);
    await lib.dig(cp.x, cp.y, cp.z);
    console.log(`Mined cobblestone at ${lib.fmt(cp)}!`);
    await sleep(200);
  } catch (e) {
    console.log('Mine error:', e.message);
  }
}

// 3. Pick up all drops
await lib.pickup(4);
console.log('Cobblestone count:', lib.count('cobblestone'));

// 4. Craft stone_pickaxe at crafting table (295, 72, -56)
const tb = bot.blockAt(new Vec3(295, 72, -56));
if (lib.count('cobblestone') >= 3 && lib.count('stick') >= 2 && tb) {
  try {
    const spRecipe = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, tb)[0];
    if (spRecipe) {
      await bot.craft(spRecipe, 1, tb);
      console.log('SUCCESS: CRAFTED STONE_PICKAXE!');
    }
  } catch (e) {
    console.log('Craft stone_pickaxe error:', e.message);
  }
}

// 5. Mine 3 more cobblestone with new stone_pickaxe
if (lib.count('stone_pickaxe') > 0) {
  await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
  const moreCobble = bot.findBlocks({
    matching: mcData.blocksByName.cobblestone.id,
    maxDistance: 4,
    count: 4
  });
  for (const cp of moreCobble) {
    if (lib.count('cobblestone') >= 3) break;
    if (cp.equals(new Vec3(295, 71, -56)) || cp.equals(new Vec3(295, 71, -55))) continue;
    try {
      await lib.dig(cp.x, cp.y, cp.z);
      console.log(`Mined extra cobble at ${lib.fmt(cp)}`);
      await sleep(150);
    } catch (e) {}
  }
  await lib.pickup(4);
}

// 6. Craft sticks if needed, then craft stone_sword
if (lib.count('stick') < 1 && lib.count('birch_planks') >= 2) {
  const sr = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
  if (sr) await bot.craft(sr, 1, null);
}

if (lib.count('cobblestone') >= 2 && lib.count('stick') >= 1 && tb) {
  try {
    const swRecipe = bot.recipesFor(mcData.itemsByName.stone_sword.id, null, 1, tb)[0];
    if (swRecipe) {
      await bot.craft(swRecipe, 1, tb);
      console.log('SUCCESS: CRAFTED STONE_SWORD!');
    }
  } catch (e) {}
}

console.log('Final inv:', JSON.stringify(lib.inv()), 'Gear:', JSON.stringify(lib.tools()));
bot.chat(`beta: Stone gear ready! Tools: ${JSON.stringify(lib.tools())}, Inv: ${JSON.stringify(lib.inv())}`);
