console.log('=== Program 975: Check Team and Base ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Time of day:', bot.time.timeOfDay, 'isDay:', bot.time.isDay);

// Teammates check
for (const pName of ['alpha', 'gamma', 'delta']) {
  const p = bot.players[pName];
  if (!p) {
    console.log(`Player ${pName}: not in player list`);
  } else if (!p.entity) {
    console.log(`Player ${pName}: online, entity out of range or in different dimension`);
  } else {
    console.log(`Player ${pName}: pos = ${lib.fmt(p.entity.position)}, held = ${p.entity.heldItem?.name}`);
  }
}

// Chest check at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems();
    console.log('Base Chest items:');
    for (const it of items) {
      console.log(`  - ${it.name} x${it.count}`);
    }
    chest.close();
  } catch (err) {
    console.log('Error opening chest:', err.message);
  }
} else {
  console.log('No chest at (293, 72, -57)!');
}

// Check nearby chests or furnaces
const chests = bot.findBlocks({
  matching: b => b && b.name.includes('chest'),
  maxDistance: 16,
  count: 5
});
console.log('Found chests at:', chests.map(p => lib.fmt(p)).join(', '));

return { inv: lib.inv(), time: bot.time.timeOfDay };
