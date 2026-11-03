// programs/622-find-door-and-quarry.js
console.log('=== Program 622: Find Door and Check Quarry Path ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

// Find oak_door
const doors = bot.findBlocks({
  matching: b => b.name.includes('door'),
  maxDistance: 10,
  count: 5
});
console.log('Doors found:', doors.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));

// Find crafting table
const tables = bot.findBlocks({
  matching: b => b.name === 'crafting_table',
  maxDistance: 10,
  count: 2
});
console.log('Crafting tables found:', tables.map(p => lib.fmt(p)));

// Find beds
const beds = bot.findBlocks({
  matching: b => b.name.includes('bed'),
  maxDistance: 10,
  count: 5
});
console.log('Beds found:', beds.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));

// Find dropped items within 32m
const drops = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 32);
console.log(`Dropped items: ${drops.length}`);
for (const d of drops) {
  console.log(`Item drop at ${lib.fmt(d.position)} dist ${bot.entity.position.distanceTo(d.position).toFixed(1)}m`);
}
