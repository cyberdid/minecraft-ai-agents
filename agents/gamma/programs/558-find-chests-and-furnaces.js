// programs/558-find-chests-and-furnaces.js
console.log('=== FIND CONTAINERS NEAR BASE ===');
const chests = bot.findBlocks({
  matching: b => b && (b.name === 'chest' || b.name === 'trapped_chest' || b.name === 'barrel'),
  maxDistance: 32,
  count: 10
});
console.log('Found chests/barrels:', chests.length);
for (const cp of chests) {
  console.log(`Chest at ${lib.fmt(cp)}`);
}

const furnaces = bot.findBlocks({
  matching: b => b && (b.name === 'furnace' || b.name === 'blast_furnace' || b.name === 'smoker'),
  maxDistance: 32,
  count: 10
});
console.log('Found furnaces:', furnaces.length);
for (const fp of furnaces) {
  console.log(`Furnace at ${lib.fmt(fp)}`);
}

// Check if any items on the ground nearby
const groundItems = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 32);
console.log('Ground items near base:', groundItems.length);
for (const it of groundItems) {
  console.log(`Item at ${lib.fmt(it.position)}: ${it.metadata ? JSON.stringify(it.metadata) : 'item'}`);
}
