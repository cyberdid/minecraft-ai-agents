// programs/007-check-base-and-hunt.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

console.log('Heading to base door at (294, 72, -54)...');
await lib.goTo(294, 72, -53, 1, { dig: true });
console.log('Outside door at', lib.fmt(bot.entity.position));

// Go through door to inspect chest
await lib.goThroughDoor(294, 72, -54);
console.log('Inside base at', lib.fmt(bot.entity.position));

const chest = await lib.chestContents(293, 72, -57);
console.log('Base chest contents:', JSON.stringify(chest));

// Check nearby players
for (const p of Object.values(bot.players)) {
  if (p.username !== 'gamma' && p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}`);
  }
}

bot.chat(`gamma checked chest: ${JSON.stringify(chest)}. night in: ${lib.time().secondsUntilNight}s`);
