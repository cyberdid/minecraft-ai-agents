// programs/304-check-team-and-blocks.js
console.log('=== Program 304: Check Team & Surroundings ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'hp:', bot.health);

for (const [name, p] of Object.entries(bot.players)) {
  if (name === 'alpha') continue;
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name}`);
  } else {
    console.log(`Player ${name} not in render distance`);
  }
}

// Ask Delta to escort Beta
bot.chat('delta: Delta, Beta is at (294, 16, 2) holding 10 obsidian! Can you bring cooked food from base chest down to Beta at (294, 16, 2)?');

// Inspect blocks ahead
const p = bot.entity.position.floored();
console.log('Block at feet:', bot.blockAt(p)?.name);
console.log('Block at head:', bot.blockAt(p.offset(0, 1, 0))?.name);
for (let dz = 1; dz <= 3; dz++) {
  const pAhead = p.offset(0, 0, dz);
  console.log(`dz=+${dz} (${lib.fmt(pAhead)}): floor=${bot.blockAt(pAhead.offset(0, -1, 0))?.name}, feet=${bot.blockAt(pAhead)?.name}, head=${bot.blockAt(pAhead.offset(0, 1, 0))?.name}`);
}
