// programs/837-check-players-and-shaft.js
console.log('=== Program 837: Check Players and Mine Shaft ===');
globalThis.isProgramCancelled = isCancelled;

console.log('Beta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Check nearby players
for (const [name, p] of Object.entries(bot.players)) {
  if (name === bot.username) continue;
  if (p && p.entity) {
    const e = p.entity;
    console.log(`Player ${name}: pos=${lib.fmt(e.position)}, heldItem=${e.heldItem ? e.heldItem.name : 'empty'}`);
  }
}

// 2. Check blocks around portal sill (299, 72, -54)
const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log('Portal sill (299, 72, -54):', sill ? sill.name : 'null');

// 3. Inspect mine shaft entrance at (302, 71, -44)
console.log('Inspecting mine shaft entrance (302, 71, -44)...');
for (let dy = 0; dy >= -10; dy--) {
  const b = bot.blockAt(new Vec3(302, 71 + dy, -44));
  console.log(`  (302, ${71 + dy}, -44): ${b ? b.name : 'null'}`);
}

bot.chat('Beta: Checking shaft entrance at (302, 71, -44). I have an empty bucket to fetch lava.');
