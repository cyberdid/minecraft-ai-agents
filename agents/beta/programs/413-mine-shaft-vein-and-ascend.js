// programs/413-mine-shaft-vein-and-ascend.js
console.log('=== Step: Mine iron vein in shaft at y=42 and ascend to base ===');
console.log('Current pos in shaft:', lib.fmt(bot.entity.position));

// 1. Scan for iron ore within 12 blocks
let ores = bot.findBlocks({
  matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
  maxDistance: 12,
  count: 15
});
console.log(`Iron ore blocks nearby in shaft: ${ores.length}`);
for (const p of ores) {
  console.log(`  Iron ore at ${lib.fmt(p)}`);
}

// 2. Mine all found iron ore blocks
let mined = 0;
for (const p of ores) {
  if (isCancelled()) break;
  try {
    const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
    if (pick) await bot.equip(pick, 'hand');
    console.log(`Mining iron ore at ${lib.fmt(p)}...`);
    await lib.goTo(p.x, p.y, p.z, 2);
    await lib.dig(p.x, p.y, p.z);
    mined++;
    console.log(`Mined iron ore #${mined} at ${lib.fmt(p)}!`);
  } catch (e) {
    console.log(`Mine error at ${lib.fmt(p)}:`, e.message);
  }
}

// 3. Collect nearby drops
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8
);
for (const d of drops) {
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.8);
  } catch (e) {}
}

console.log(`Mined ${mined} ores. raw_iron in inventory: ${lib.count('raw_iron')}`);

// 4. Check time until night
console.log(`Seconds until night: ${bot.time.secondsUntilNight || 'day'}`);

// 5. Ascend the staircase back to base before night:
// Staircase path: (302, 55, -40) -> (302, 65, -42) -> (301, 71, -45) -> base door (294, 72, -54)
const ascentWaypoints = [
  new Vec3(302, 50, -39),
  new Vec3(302, 60, -41),
  new Vec3(302, 71, -44),
  new Vec3(295, 72, -52)
];

for (const wp of ascentWaypoints) {
  if (isCancelled()) break;
  try {
    console.log(`Ascending towards ${lib.fmt(wp)}...`);
    await lib.goTo(wp.x, wp.y, wp.z, 2);
    console.log(`Reached near ${lib.fmt(wp)}, pos=${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Ascent error to ${lib.fmt(wp)}:`, err.message);
  }
}

// 6. Enter base door (294, 72, -54)
try {
  console.log('Entering base door...');
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door entry note:', e.message);
}

// 7. If we have raw_iron, put it into base furnace F1 (295, 72, -55) to smelt
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

console.log(`Beta back at base. raw_iron in inv: ${lib.count('raw_iron')}, pos: ${lib.fmt(bot.entity.position)}`);
bot.chat(`beta: Mined shaft iron! Carrying raw iron to base furnaces. In base at ${lib.fmt(bot.entity.position)}.`);
