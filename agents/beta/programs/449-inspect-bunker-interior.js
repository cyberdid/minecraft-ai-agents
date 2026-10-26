// programs/449-inspect-bunker-interior.js
console.log('=== Step: Inspect bunker interior blocks and surroundings ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

const p = bot.entity.position.floored();
for (let dx = -1; dx <= 1; dx++) {
  for (let dy = -1; dy <= 2; dy++) {
    for (let dz = -1; dz <= 1; dz++) {
      const b = bot.blockAt(p.offset(dx, dy, dz));
      if (b && b.name !== 'air') {
        console.log(`Block at offset (${dx}, ${dy}, ${dz}): ${b.name}`);
      }
    }
  }
}

// Check nearby players
for (const [name, player] of Object.entries(bot.players)) {
  if (player.entity && name !== 'beta') {
    const dist = bot.entity.position.distanceTo(player.entity.position).toFixed(1);
    console.log(`Player ${name} at ${lib.fmt(player.entity.position)}, dist=${dist}m, held=${player.entity.heldItem?.name}`);
  }
}

// Check nearby drops within 6m
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8
);
console.log(`Drops within 8m: ${drops.length}`);
for (const d of drops) {
  console.log(`  Drop at ${lib.fmt(d.position)}`);
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.8);
  } catch (e) {}
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
