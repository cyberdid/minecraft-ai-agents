// programs/558-inspect-base-and-craft.js
console.log('=== Program 558: Inspect Base Exit & Craft Gear ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Find doors
const doors = bot.findBlocks({
  matching: b => b && b.name.includes('door'),
  maxDistance: 16,
  count: 5
});
console.log('Doors found:', doors.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));

// Find crafting table
const tables = bot.findBlocks({
  matching: b => b && b.name.includes('crafting_table'),
  maxDistance: 16,
  count: 5
});
console.log('Crafting tables found:', tables.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));

// Check portal at (298, 72, -54)
const portalBlocks = bot.findBlocks({
  matching: b => b && b.name.includes('portal'),
  maxDistance: 16,
  count: 5
});
console.log('Portal blocks found:', portalBlocks.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));
