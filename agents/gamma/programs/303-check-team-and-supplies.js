// programs/303-check-team-and-supplies.js
console.log('=== CHECK TEAM & SUPPLIES ===');
console.log('Gamma:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'HP:', bot.health);

for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'gamma') {
    const held = p.entity.heldItem?.name || 'none';
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} holding: ${held}`);
  }
}

// Check chest
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Chest contents at (293, 72, -57):', JSON.stringify(contents));
} catch (e) {
  console.log('Chest note:', e.message);
}

// Ask Delta
bot.chat('delta, alpha: I am at 3 food in base shelter. Any spare food or bread?');
