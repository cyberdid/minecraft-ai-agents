// programs/622-find-trees-and-door.js
console.log('=== Program 622: Find Trees & Base Exits ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

// 1. Scan for logs with maxDistance: 80
const logs = bot.findBlocks({
  matching: b => b.name.includes('_log'),
  maxDistance: 80,
  count: 10
});
console.log(`Found ${logs.length} logs within 80m:`);
for (const p of logs) {
  const b = bot.blockAt(p);
  console.log(`- ${b.name} at ${lib.fmt(p)} (dist: ${bot.entity.position.distanceTo(p).toFixed(1)}m)`);
}

// 2. Scan for doors in base
const doors = bot.findBlocks({
  matching: b => b.name.includes('door'),
  maxDistance: 15,
  count: 5
});
console.log(`Found ${doors.length} doors:`);
for (const d of doors) {
  console.log(`- ${bot.blockAt(d)?.name} at ${lib.fmt(d)}`);
}

// 3. Scan for any crafting tables or chests
const tables = bot.findBlocks({
  matching: b => b.name.includes('crafting_table'),
  maxDistance: 20,
  count: 5
});
console.log(`Found ${tables.length} crafting tables:`);
for (const t of tables) {
  console.log(`- table at ${lib.fmt(t)}`);
}
