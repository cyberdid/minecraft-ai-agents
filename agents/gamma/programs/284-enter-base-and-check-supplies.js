// programs/284-enter-base-and-check-supplies.js
console.log('=== ENTER BASE & CHECK SUPPLIES ===');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Walk to base door at (294, 72, -53)
console.log('Approaching base entrance...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 12000 });
} catch (e) {
  console.log('goTo door approach warning:', e.message);
}

// 2. Go through door at (294, 72, -54)
console.log('Passing through door at (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Entered base successfully!');
} catch (e) {
  console.log('goThroughDoor note:', e.message);
  // Fallback: manually open door if needed or walk inside
  const doorBlock = bot.blockAt(new Vec3(294, 72, -54));
  if (doorBlock) {
    console.log('Door block state:', doorBlock.name, doorBlock._properties);
    try {
      await lib.door(294, 72, -54, true);
      await lib.walkTo(294.5, -55.5, 3000);
      await lib.door(294, 72, -54, false);
    } catch (e2) {
      console.log('Door fallback note:', e2.message);
    }
  }
}

console.log('Position inside/near base:', lib.fmt(bot.entity.position));

// 3. Inspect chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);
console.log('Chest block:', chestBlock ? chestBlock.name : 'null');

if (chestBlock && chestBlock.name.includes('chest')) {
  try {
    const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
    console.log('Chest contents at (293, 72, -57):', JSON.stringify(contents));
  } catch (e) {
    console.log('Error inspecting chest:', e.message);
  }
}

// Check if any other chests exist nearby
const nearbyChests = bot.findBlocks({
  matching: b => b && b.name.includes('chest'),
  maxDistance: 16,
  count: 5
});
console.log('All nearby chests:', nearbyChests.map(p => `${lib.fmt(p)}`));

// Check furnaces
const nearbyFurnaces = bot.findBlocks({
  matching: b => b && b.name.includes('furnace'),
  maxDistance: 16,
  count: 5
});
console.log('Nearby furnaces:', nearbyFurnaces.map(p => `${lib.fmt(p)}`));

// Check beds
const nearbyBeds = bot.findBlocks({
  matching: b => b && b.name.includes('bed'),
  maxDistance: 16,
  count: 5
});
console.log('Nearby beds:', nearbyBeds.map(p => `${lib.fmt(p)}`));

console.log('Gamma inventory now:', JSON.stringify(lib.inv()));
