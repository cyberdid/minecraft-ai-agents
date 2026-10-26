console.log('Position before:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// Check for door around base
const doors = bot.findBlocks({
  matching: b => b.name.includes('door'),
  maxDistance: 16,
  count: 5
});

if (doors.length > 0) {
  const d = doors[0];
  console.log('Found door at:', lib.fmt(d), bot.blockAt(d).name);
  await lib.goThroughDoor(d.x, d.y, d.z);
} else {
  console.log('No door found, walking to inside base at (294, 72, -56)');
  await lib.goTo(294, 72, -56, 1);
}

console.log('Position after:', lib.fmt(bot.entity.position));

const chests = bot.findBlocks({
  matching: b => b.name === 'chest',
  maxDistance: 6,
  count: 5
});

if (chests.length > 0) {
  const c = chests[0];
  const contents = await lib.chestContents(c.x, c.y, c.z);
  console.log('Chest contents at', lib.fmt(c), ':', JSON.stringify(contents));
}

const beds = bot.findBlocks({
  matching: b => b.name.includes('bed'),
  maxDistance: 6,
  count: 5
});
if (beds.length > 0) {
  console.log('Bed found at:', lib.fmt(beds[0]));
  try {
    await lib.setSpawn();
    console.log('Spawn set!');
  } catch (e) {
    console.log('setSpawn error:', e.message);
  }
}

bot.chat('delta: Inside base for the night!');
