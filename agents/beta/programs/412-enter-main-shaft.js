// programs/412-enter-main-shaft.js
console.log('=== Step: Walk through base door and enter main shaft ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Go through base door with close: false
const res = await lib.goThroughDoor(294, 72, -54, { close: false });
console.log('Door passage result:', res);
console.log('Outside base pos:', lib.fmt(bot.entity.position));

// Optional: close door from outside
const door = bot.blockAt(new Vec3(294, 72, -54));
if (door && door._properties?.open) {
  try {
    await bot.activateBlock(door);
    console.log('Door closed from outside.');
  } catch (e) {}
}

// 2. Walk to shaft entrance (302, 71, -44)
console.log('Walking to shaft entrance (302, 71, -44)...');
await lib.goTo(302, 71, -44, 1.5);
console.log('At shaft entrance! Pos:', lib.fmt(bot.entity.position));

// 3. Descend shaft stairs down towards y=50 then y=35
// The safe column is x=302..304, z=-42..-34
const shaftSteps = [
  new Vec3(303, 65, -42),
  new Vec3(303, 55, -40),
  new Vec3(303, 45, -38),
  new Vec3(303, 35, -38)
];

for (const sp of shaftSteps) {
  if (isCancelled()) break;
  try {
    console.log(`Descending shaft towards ${lib.fmt(sp)}...`);
    await lib.goTo(sp.x, sp.y, sp.z, 2);
    console.log(`Reached near ${lib.fmt(sp)}, pos=${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Shaft descent note at ${lib.fmt(sp)}:`, e.message);
  }

  // Scan for iron ore along shaft
  const ores = bot.findBlocks({
    matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
    maxDistance: 8,
    count: 5
  });
  if (ores.length > 0) {
    console.log(`Found ${ores.length} iron ores in shaft at depth y=${bot.entity.position.y.toFixed(0)}!`);
    for (const ip of ores) {
      if (isCancelled()) break;
      try {
        const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
        if (pick) await bot.equip(pick, 'hand');
        await lib.dig(ip.x, ip.y, ip.z);
        console.log(`Mined iron ore at ${lib.fmt(ip)}! raw_iron in inv: ${lib.count('raw_iron')}`);
      } catch (err) {}
    }
  }
}

console.log(`Descent stage complete. Current pos: ${lib.fmt(bot.entity.position)}, raw_iron: ${lib.count('raw_iron')}`);
bot.chat(`beta: Shaft mining status: depth y=${bot.entity.position.y.toFixed(0)}, raw_iron=${lib.count('raw_iron')}, pickaxes=${lib.count('stone_pickaxe')}.`);
