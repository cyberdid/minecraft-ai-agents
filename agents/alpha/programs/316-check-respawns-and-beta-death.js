// programs/316-check-respawns-and-beta-death.js
console.log('=== Program 316: Check Respawns & Drops ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'hp:', bot.health, 'food:', bot.food);

// Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (name === 'alpha') continue;
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name}`);
  } else {
    console.log(`Player ${name} not nearby`);
  }
}

// Ask in chat
bot.chat('beta: Beta, where was your death spot? Was it in the shaft staircase? Delta/Gamma, did you pick up the 10 obsidian?');

// Check inside base chest
try {
  const chestPos = new Vec3(293, 72, -57);
  const items = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Base chest contents:', JSON.stringify(items));
} catch (e) {
  console.log('Chest check note:', e.message);
}
