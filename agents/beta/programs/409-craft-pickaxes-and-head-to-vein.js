// programs/409-craft-pickaxes-and-head-to-vein.js
console.log('=== Step: Craft fresh pickaxes at base, check chest, then head to East hill vein ===');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Walk into base through door (294, 72, -54)
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door note:', e.message);
}

// 2. Craft 2 stone pickaxes at (295, 72, -56)
const tableBlock = bot.blockAt(new Vec3(295, 72, -56));
if (tableBlock && lib.count('stick') >= 2 && lib.count('cobblestone') >= 3) {
  const tr = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, tableBlock)[0];
  if (tr) {
    await bot.craft(tr, 2, tableBlock);
    console.log('Crafted 2 fresh stone pickaxes! Pickaxes:', lib.count('stone_pickaxe'));
  }
}

// 3. Check chest for any new food deposited by Alpha or Delta
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const edible = chest.containerItems().filter(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'rotten_flesh'].includes(i.name));
    for (const fd of edible) {
      await chest.withdraw(fd.type, null, Math.min(fd.count, 4));
      console.log(`Withdrew ${fd.name}x${Math.min(fd.count, 4)} from chest!`);
      break;
    }
    chest.close();
  } catch (e) {}
}

// Eat if we got food
for (const fd of ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'rotten_flesh']) {
  while (lib.count(fd) > 0 && bot.food < 20 && !isCancelled()) {
    try {
      await bot.equip(mcData.itemsByName[fd].id, 'hand');
      await bot.consume();
      console.log(`Ate ${fd}. Food: ${bot.food}/20`);
      await sleep(300);
    } catch (e) { break; }
  }
}

// 4. Step outside through door
console.log('Stepping outside towards East hill vein...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

// 5. Navigate to East hill vein (354, 28, -37)
const veinWaypoints = [
  new Vec3(315, 70, -48),
  new Vec3(335, 65, -42),
  new Vec3(350, 58, -36),
  new Vec3(354, 30, -37)
];

for (const wp of veinWaypoints) {
  if (isCancelled()) break;
  try {
    console.log(`Advancing to ${lib.fmt(wp)}...`);
    await lib.goTo(wp.x, wp.y, wp.z, 2);
    console.log(`Arrived near ${lib.fmt(wp)}, pos=${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Nav error to ${lib.fmt(wp)}:`, err.message);
  }
}

// 6. Scan for iron ore
const ironOres = bot.findBlocks({
  matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
  maxDistance: 12,
  count: 15
});
console.log(`Iron ore blocks found at vein location: ${ironOres.length}`);

for (const ip of ironOres) {
  if (isCancelled()) break;
  try {
    const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
    if (pick) await bot.equip(pick, 'hand');
    await lib.dig(ip.x, ip.y, ip.z);
    console.log(`Mined iron ore at ${lib.fmt(ip)}!`);
  } catch (e) {
    console.log('Dig error:', e.message);
  }
}

console.log(`Finished stage. raw_iron in inventory: ${lib.count('raw_iron')}, pos: ${lib.fmt(bot.entity.position)}`);
bot.chat(`beta: At East hill vein! raw_iron in inv: ${lib.count('raw_iron')}, pickaxes: ${lib.count('stone_pickaxe')}. Mining iron!`);
