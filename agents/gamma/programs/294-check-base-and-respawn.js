// programs/294-check-base-and-respawn.js
console.log('=== CHECK BASE & TEAM ===');
console.log('Gamma pos:', lib.fmt(bot.entity.position));
console.log('Status:', JSON.stringify(lib.status()));

console.log('\n--- PLAYERS ---');
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    console.log(`Player ${name}: pos=${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name || 'none'}`);
  } else {
    console.log(`Player ${name}: no entity (different dim or far)`);
  }
}

// Check base chest
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Chest contents at (293, 72, -57):', JSON.stringify(contents));
} catch (e) {
  console.log('Chest inspect note:', e.message);
}

// Check time
const t = lib.time();
console.log(`Time: ${t.timeOfDay} (${t.phase}), canSleep: ${t.canSleep}, night in ${t.secondsUntilNight}s`);
