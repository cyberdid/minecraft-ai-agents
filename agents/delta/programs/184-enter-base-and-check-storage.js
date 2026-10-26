// programs/184-enter-base-and-check-storage.js
console.log('Delta pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// Navigate to base door
const doors = bot.findBlocks({
  matching: b => b.name.includes('door'),
  maxDistance: 20,
  count: 5
});

if (doors.length > 0) {
  const d = doors[0];
  console.log('Found door at:', lib.fmt(d), bot.blockAt(d).name);
  try {
    await lib.goThroughDoor(d.x, d.y, d.z);
    console.log('Went through door successfully!');
  } catch (err) {
    console.log('goThroughDoor error:', err.message);
    await lib.goTo(294, 72, -56, 1);
  }
} else {
  console.log('No door found, walking directly towards (294, 72, -56)');
  await lib.goTo(294, 72, -56, 1);
}

console.log('Inside base pos:', lib.fmt(bot.entity.position));

// Check chests
const chests = bot.findBlocks({
  matching: b => b.name === 'chest',
  maxDistance: 8,
  count: 5
});
console.log(`Found ${chests.length} chests`);
for (const c of chests) {
  try {
    const contents = await lib.chestContents(c.x, c.y, c.z);
    console.log(`Chest at ${lib.fmt(c)}:`, JSON.stringify(contents));
  } catch (err) {
    console.log(`Error reading chest at ${lib.fmt(c)}:`, err.message);
  }
}

// Check furnaces
const furnaces = bot.findBlocks({
  matching: b => b.name.includes('furnace'),
  maxDistance: 8,
  count: 5
});
console.log(`Found ${furnaces.length} furnaces`);
for (const f of furnaces) {
  try {
    const block = bot.blockAt(f);
    console.log(`Furnace at ${lib.fmt(f)}: ${block.name}`);
  } catch (err) {
    console.log(`Error reading furnace at ${lib.fmt(f)}:`, err.message);
  }
}

bot.chat('Delta: Respawned safe at base. Regrouping and gearing up with armor and shields!');
