// programs/417-mine-vein-and-return-for-feast.js
console.log('=== Step: Mine remaining iron at y=26..30, ascend to base, eat beef, smelt chestplate ===');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Scan and mine remaining iron ore blocks within 8 blocks
let ores = bot.findBlocks({
  matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
  maxDistance: 8,
  count: 10
});
console.log(`Iron ore blocks nearby (${ores.length}):`);

for (const ip of ores) {
  if (isCancelled() || lib.count('raw_iron') >= 9) break;
  try {
    const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
    if (pick) await bot.equip(pick, 'hand');
    console.log(`Mining iron ore at ${lib.fmt(ip)}...`);
    await lib.goTo(ip.x, ip.y, ip.z, 2);
    await lib.dig(ip.x, ip.y, ip.z);
    console.log(`Mined iron ore at ${lib.fmt(ip)}! raw_iron in inv: ${lib.count('raw_iron')}`);
  } catch (e) {
    console.log('Mine error:', e.message);
  }
}

// Collect drops
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8
);
for (const d of drops) {
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.8);
  } catch (e) {}
}

console.log(`Total raw_iron gathered: ${lib.count('raw_iron')}`);

// 2. Ascend to base via east ramp and main shaft
const ascentWaypoints = [
  new Vec3(310, 35, -41),
  new Vec3(304, 45, -39),
  new Vec3(302, 60, -42),
  new Vec3(302, 71, -44),
  new Vec3(295, 72, -52)
];

for (const wp of ascentWaypoints) {
  if (isCancelled()) break;
  try {
    console.log(`Ascending towards ${lib.fmt(wp)}...`);
    await lib.goTo(wp.x, wp.y, wp.z, 2);
    console.log(`Reached ${lib.fmt(wp)}, pos=${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Ascent note to ${lib.fmt(wp)}:`, e.message);
  }
}

// 3. Enter base door (294, 72, -54)
try {
  console.log('Entering base door...');
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door entry note:', e.message);
}

// 4. Check chest for Alpha\'s 2 cooked beef and eat
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const beef = chest.containerItems().find(i => i.name === 'cooked_beef');
    if (beef) {
      await chest.withdraw(beef.type, null, beef.count);
      console.log(`Withdrew ${beef.count} cooked_beef from chest!`);
    }
    chest.close();
  } catch (e) {}
}

// Eat cooked beef
while (lib.count('cooked_beef') > 0 && bot.food < 20 && !isCancelled()) {
  try {
    await bot.equip(mcData.itemsByName.cooked_beef.id, 'hand');
    await bot.consume();
    console.log(`Ate cooked_beef! Food now: ${bot.food}/20, Health: ${bot.health}/20`);
    await sleep(350);
  } catch (e) { break; }
}

// 5. Put raw_iron into F1 to smelt
if (lib.count('raw_iron') > 0) {
  const fb1 = bot.blockAt(new Vec3(295, 72, -55));
  if (fb1) {
    try {
      const f1 = await bot.openFurnace(fb1);
      if (!f1.fuelItem() && lib.count('coal') > 0) {
        await f1.putFuel(mcData.itemsByName.coal.id, null, 2);
      }
      await f1.putInput(mcData.itemsByName.raw_iron.id, null, lib.count('raw_iron'));
      console.log(`Loaded ${lib.count('raw_iron')} raw iron into F1!`);
      f1.close();
    } catch (e) {}
  }
}

console.log(`Beta back in base. Food: ${bot.food}/20, Health: ${bot.health}/20, raw_iron: ${lib.count('raw_iron')}`);
bot.chat(`beta: Returned to base! Food: ${bot.food}/20, Health: ${bot.health}/20. Loaded raw iron into F1 for iron_chestplate!`);
