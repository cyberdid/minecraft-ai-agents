// programs/278-inspect-local-and-quarry.js
console.log('=== INSPECT LOCAL BLOCKS & QUARRY NETHERRACK ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Scan immediate walls, floor, ceiling around Gamma (x=43..46, y=64..67, z=-172..-176)
console.log('--- Scanning immediate structure around (44, 65, -174) ---');
for (let y = 67; y >= 64; y--) {
  for (let z = -172; z >= -176; z--) {
    let line = `y=${y} z=${z}: `;
    for (let x = 43; x <= 46; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      line += `x${x}:${b ? (b.name === 'air' ? '.' : b.name.slice(0, 4)) : '?'} `;
    }
    console.log(line);
  }
}

// 2. Check for netherrack adjacent to us that can be safely quarried without breaching walls
const quarryTargets = [];
for (let dy = 0; dy <= 2; dy++) {
  for (let dz = -2; dz <= 2; dz++) {
    for (let dx = 1; dx <= 3; dx++) {
      const p = bot.entity.position.offset(dx, dy, dz).floored();
      const b = bot.blockAt(p);
      if (b && b.name === 'netherrack') {
        quarryTargets.push(p);
      }
    }
  }
}

console.log(`Found ${quarryTargets.length} netherrack blocks to the East.`);

// Equip pickaxe
await bot.equip(bot.inventory.items().find(i => i.name.includes('pickaxe')), 'hand');
console.log('Equipped:', bot.entity.equipment[0]?.name);

// Mine up to 20 netherrack
let mined = 0;
for (const target of quarryTargets) {
  if (mined >= 20 || isCancelled()) break;
  const b = bot.blockAt(target);
  if (b && b.name === 'netherrack') {
    try {
      await bot.dig(b);
      mined++;
    } catch (e) {
      console.log('Dig error:', e.message);
    }
  }
}

console.log(`Mined ${mined} netherrack blocks.`);
try {
  await lib.pickup(5);
} catch (e) {}

// Check teammates
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username && p.entity) {
    console.log(`Teammate ${p.username} at ${lib.fmt(p.entity.position)} dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

// Check weapon equipped again
await lib.equipWeapon();

console.log('\n=== STATUS AT END OF PROGRAM ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma mined ${mined} netherrack at ${lib.fmt(bot.entity.position)}! Total blocks: ${lib.count('netherrack') + lib.count('cobblestone')}. Ready to fortify bridge to Spawner!`);
