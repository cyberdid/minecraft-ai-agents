// programs/242-return-to-base-and-check-chest.js
console.log('=== Return to Base and Check Chest ===');
console.log('Current beta position:', lib.fmt(bot.entity.position));

// 1. Walk to base door
console.log('Walking towards base door at (294, 72, -53)...');
await lib.goTo(294, 72, -53, 1);
console.log('At base door. Door block:', lib.blockAt(294, 72, -54)?.name);

// 2. Go through door or enter
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Entered base through door.');
} catch (e) {
  console.log('goThroughDoor note:', e.message);
  await lib.goTo(294, 72, -56, 1);
}

// 3. Check players in world
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}, health: ${p.entity.health ?? 'unknown'}`);
  }
}

// 4. Find and inspect chests
const chests = bot.findBlocks({
  matching: b => b && (b.name === 'chest' || b.name === 'trapped_chest'),
  maxDistance: 16,
  count: 5
});
console.log(`Found ${chests.length} chests near base:`, chests.map(c => lib.fmt(c)));

for (const c of chests) {
  try {
    const contents = await lib.chestContents(c.x, c.y, c.z);
    console.log(`Chest at ${lib.fmt(c)} contents:`, JSON.stringify(contents));
  } catch (e) {
    console.log(`Error reading chest at ${lib.fmt(c)}:`, e.message);
  }
}

console.log('Beta inventory:', JSON.stringify(lib.inv()));
bot.chat('beta: At base, inspecting supplies.');
