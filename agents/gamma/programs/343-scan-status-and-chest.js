// programs/343-scan-status-and-chest.js
console.log('=== SCAN PLAYERS & ENVIRONMENT ===');
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    console.log(`Player: ${name} at ${lib.fmt(p.entity.position)} in dimension ${bot.game.dimension}`);
  } else {
    console.log(`Player: ${name} (no entity loaded)`);
  }
}
console.log('My position:', lib.fmt(bot.entity.position), 'Dim:', bot.game.dimension);

// Enter base and check chest
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 8000 });
} catch (e) {}

try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);
if (chestBlock && chestBlock.name.includes('chest')) {
  try {
    const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
    console.log('Chest contents at (293, 72, -57):', JSON.stringify(contents));
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// Check dropped items inside base
const items = Object.values(bot.entities).filter(e => e && e.name === 'item' && e.position.distanceTo(bot.entity.position) < 8);
if (items.length > 0) {
  console.log(`Dropped items nearby: ${items.length}`);
  await lib.pickup(6);
}

console.log('Current inv:', JSON.stringify(lib.inv()));
