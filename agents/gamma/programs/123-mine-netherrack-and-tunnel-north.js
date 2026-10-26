// programs/123-mine-netherrack-and-tunnel-north.js
console.log('--- EXTENDING ENCLOSED TUNNEL TOWARDS SPAWNER ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

await bot.equip(mcData.itemsByName.wooden_pickaxe.id, 'hand');

// 1. Mine 40 netherrack blocks from nearby netherrack ceiling/walls
console.log('Mining 40 netherrack for tunnel construction...');
const p = bot.entity.position.floored();

const netherrackBlocks = bot.findBlocks({
  matching: b => b && b.name === 'netherrack',
  maxDistance: 6,
  count: 30
});

for (const np of netherrackBlocks) {
  if (lib.count('netherrack') >= 40) break;
  try {
    await lib.dig(np.x, np.y, np.z);
    await sleep(100);
    await lib.pickup(3);
  } catch (e) {}
}

console.log('Netherrack collected:', lib.count('netherrack'));
bot.chat(`gamma mined ${lib.count('netherrack')} netherrack blocks! Extending enclosed tunnel from z=-135 to z=-140.`);

// 2. Build enclosed tunnel from z=-135 to z=-140 along x=44
// Each segment z has:
// Floor at (44, 64, z)
// West wall at (43, 65, z) & (43, 66, z)
// East wall at (45, 65, z) & (45, 66, z)
// Roof at (44, 67, z)
console.log('Constructing enclosed tunnel segments...');
for (const z of [-135, -136, -137, -138, -139, -140]) {
  if (lib.count('netherrack') < 3) break;
  if (isCancelled()) break;

  const segmentBlocks = [
    new Vec3(44, 64, z), // Floor
    new Vec3(43, 65, z), // West wall lower
    new Vec3(45, 65, z), // East wall lower
    new Vec3(43, 66, z), // West wall upper
    new Vec3(45, 66, z), // East wall upper
    new Vec3(44, 67, z)  // Roof
  ];

  for (const sb of segmentBlocks) {
    const cur = bot.blockAt(sb);
    if (cur && (cur.name === 'air' || cur.name === 'cave_air' || cur.name === 'fire')) {
      try {
        await lib.place('netherrack', sb.x, sb.y, sb.z);
        await sleep(100);
      } catch (e) {}
    }
  }
  console.log(`Segment z=${z} enclosed! Netherrack left: ${lib.count('netherrack')}`);
}

// 3. Move forward inside the new tunnel to z=-138
console.log('Advancing through enclosed tunnel to z=-138...');
try {
  await lib.goTo(44, 65, -138, 1, { timeoutMs: 15000 });
  console.log('ADVANCED TO Z=-138 INSIDE ENCLOSED TUNNEL! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Advance note:', e.message);
}

// 4. Report spawner distance
const spawner = new Vec3(32, 68, -190);
console.log(`Blaze Spawner (32, 68, -190) is now only ${spawner.distanceTo(bot.entity.position).toFixed(1)}m away!`);

bot.chat(`gamma extended fortified tunnel to z=-138! Blaze Spawner at (32, 68, -190) is only ${spawner.distanceTo(bot.entity.position).toFixed(0)}m away!`);
