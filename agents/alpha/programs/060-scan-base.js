// programs/060-scan-base.js
// Scan around alpha to find all containers and functional blocks

console.log('Position:', lib.fmt(bot.entity.position));

const specialTypes = ['chest', 'trapped_chest', 'barrel', 'furnace', 'blast_furnace', 'smoker', 'crafting_table', 'white_bed', 'oak_door', 'iron_door'];

for (const type of specialTypes) {
  const found = bot.findBlocks({
    matching: mcData.blocksByName[type]?.id,
    maxDistance: 16,
    count: 10
  });
  if (found && found.length > 0) {
    console.log(`Found ${type} (${found.length}):`, found.map(p => lib.fmt(p)).join(', '));
  }
}

// Also check blocks in floor/walls
const pos = bot.entity.position.floored();
console.log('Surrounding blocks check complete.');
