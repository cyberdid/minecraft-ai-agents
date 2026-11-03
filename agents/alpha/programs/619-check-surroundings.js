// programs/619-check-surroundings.js
console.log('=== Program 619: Check Base Interior & Surroundings ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

// Check blocks within 5 blocks of base
const blocks = [];
for (let dx = -4; dx <= 4; dx++) {
  for (let dy = -1; dy <= 3; dy++) {
    for (let dz = -4; dz <= 4; dz++) {
      const p = bot.entity.position.offset(dx, dy, dz);
      const b = bot.blockAt(p);
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        blocks.push({ name: b.name, pos: p });
      }
    }
  }
}

const counts = {};
for (const b of blocks) {
  counts[b.name] = (counts[b.name] || 0) + 1;
}
console.log('Nearby block summary:', counts);

// Look for special blocks: chests, furnaces, crafting table, door, beds
for (const b of blocks) {
  if (['chest', 'crafting_table', 'furnace', 'oak_door', 'iron_door', 'red_bed', 'white_bed', 'nether_portal'].some(k => b.name.includes(k))) {
    console.log(`Key block: ${b.name} at ${lib.fmt(b.pos)}`);
  }
}

// Check other furnaces
for (const b of blocks.filter(x => x.name.includes('furnace'))) {
  try {
    const fBlock = bot.blockAt(b.pos);
    const furnace = await bot.openFurnace(fBlock);
    console.log(`Furnace at ${lib.fmt(b.pos)}: In=${furnace.inputItem()?.name} x${furnace.inputItem()?.count}, Fuel=${furnace.fuelItem()?.name} x${furnace.fuelItem()?.count}, Out=${furnace.outputItem()?.name} x${furnace.outputItem()?.count}`);
    furnace.close();
  } catch (e) {
    console.log(`Failed reading furnace at ${lib.fmt(b.pos)}:`, e.message);
  }
}
