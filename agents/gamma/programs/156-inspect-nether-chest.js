// programs/156-inspect-nether-chest.js
console.log('--- INSPECTING NETHER CHEST AT (39, 65, -8) ---');
try {
  const contents = await lib.chestContents(39, 65, -8);
  console.log('Chest (39, 65, -8) contents:', JSON.stringify(contents));
} catch (e) {
  console.log('Error opening chest:', e.message);
}

// Check bunker walls around portal (38..42, 64..68, -9..-5)
console.log('Checking bunker enclosure:');
const blocks = [];
for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    const b = bot.blockAt(bot.entity.position.offset(dx, 0, dz));
    if (b && b.name !== 'air' && b.name !== 'nether_portal') {
      blocks.push(`${dx},${dz}: ${b.name}`);
    }
  }
}
console.log('Bunker floor/wall blocks nearby:', blocks.join('; '));
