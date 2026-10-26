// programs/416-mine-shaft-for-chestplate.js
console.log('=== Step: Mine iron in main shaft at y=35..25 for iron_chestplate ===');
console.log('Starting pos:', lib.fmt(bot.entity.position));

// 1. Step through door
try {
  await lib.goThroughDoor(294, 72, -54, { close: false });
  console.log('Outside base pos:', lib.fmt(bot.entity.position));
} catch (e) {}

// 2. Walk to shaft entrance (302, 71, -44)
try {
  await lib.goTo(302, 71, -44, 1.5);
  console.log('At shaft entrance!');
} catch (e) {}

// 3. Descend shaft to y=35 (x=303, z=-40)
const waypoints = [
  new Vec3(303, 60, -42),
  new Vec3(303, 48, -40),
  new Vec3(305, 36, -44),
  new Vec3(305, 28, -42)
];

for (const wp of waypoints) {
  if (isCancelled()) break;
  try {
    console.log(`Advancing to ${lib.fmt(wp)}...`);
    await lib.goTo(wp.x, wp.y, wp.z, 2);
    console.log(`Reached ${lib.fmt(wp)}, pos=${lib.fmt(bot.entity.position)}`);
  } catch (e) {}

  // Scan for iron ore within 10 blocks
  const ores = bot.findBlocks({
    matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
    maxDistance: 10,
    count: 10
  });
  if (ores.length > 0) {
    console.log(`Found ${ores.length} iron ore blocks at depth y=${bot.entity.position.y.toFixed(0)}!`);
    for (const ip of ores) {
      if (isCancelled() || lib.count('raw_iron') >= 12) break;
      try {
        const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
        if (pick) await bot.equip(pick, 'hand');
        console.log(`Mining iron ore at ${lib.fmt(ip)}...`);
        await lib.goTo(ip.x, ip.y, ip.z, 2);
        await lib.dig(ip.x, ip.y, ip.z);
        console.log(`Mined iron ore at ${lib.fmt(ip)}! raw_iron: ${lib.count('raw_iron')}`);
      } catch (err) {}
    }
  }
}

// 4. Collect any floating item drops
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8
);
for (const d of drops) {
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.8);
  } catch (e) {}
}

console.log(`Shaft mining completed. raw_iron in inventory: ${lib.count('raw_iron')}, depth: ${bot.entity.position.y.toFixed(0)}`);
bot.chat(`beta: Shaft expedition: depth y=${bot.entity.position.y.toFixed(0)}, raw_iron=${lib.count('raw_iron')}. Ascending to base furnaces!`);
