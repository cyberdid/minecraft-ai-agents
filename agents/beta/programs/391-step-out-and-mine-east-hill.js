// programs/391-step-out-and-mine-east-hill.js
console.log('=== Step: Restock cobble, go through door, and advance to East hill ===');

// 1. Take more cobblestone from chest if needed
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb && lib.count('cobblestone') < 20) {
  try {
    const chest = await bot.openChest(cb);
    const cobbles = chest.containerItems().filter(i => i.name === 'cobblestone');
    for (const c of cobbles) {
      if (lib.count('cobblestone') >= 20) break;
      const takeCount = Math.min(c.count, 20 - lib.count('cobblestone'));
      await chest.withdraw(c.type, null, takeCount);
      console.log(`Withdrew ${takeCount} cobblestone.`);
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}
console.log('Cobblestone count:', lib.count('cobblestone'));

// 2. Go through base door (294, 72, -54)
console.log('Going through base door at (294, 72, -54)...');
await lib.goThroughDoor(294, 72, -54);
console.log('Outside base! Current pos:', lib.fmt(bot.entity.position));

// 3. Move towards East hill in stages: (315, 70, -45) -> (335, 65, -40) -> (350, 60, -35)
const waypoints = [
  new Vec3(315, 70, -45),
  new Vec3(335, 65, -40),
  new Vec3(350, 60, -35)
];

for (const wp of waypoints) {
  if (isCancelled()) break;
  console.log(`Moving towards waypoint ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2);
    console.log(`Arrived near ${lib.fmt(wp)}, now at ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Waypoint ${lib.fmt(wp)} navigation note:`, err.message);
  }

  // Scan for iron ore within 12 blocks
  const ironBlocks = bot.findBlocks({
    matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
    maxDistance: 12,
    count: 10
  });

  if (ironBlocks.length > 0) {
    console.log(`Found ${ironBlocks.length} iron ore blocks!`);
    for (const ip of ironBlocks) {
      if (isCancelled()) break;
      const ib = bot.blockAt(ip);
      if (ib) {
        console.log(`Mining iron ore at ${lib.fmt(ip)}...`);
        try {
          await lib.dig(ip.x, ip.y, ip.z);
          console.log(`Mined iron ore at ${lib.fmt(ip)}! Raw iron now: ${lib.count('raw_iron')}`);
        } catch (e) {
          console.log('Dig error:', e.message);
        }
      }
    }
  }
}

console.log(`Finished expedition stage. Raw iron: ${lib.count('raw_iron')}, Pos: ${lib.fmt(bot.entity.position)}`);
bot.chat(`beta: East hill status: Pos=${lib.fmt(bot.entity.position)}, raw_iron=${lib.count('raw_iron')}, pickaxe=${lib.count('stone_pickaxe')}.`);
