// programs/038-surface-and-witness.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// Climb last stretch to surface (302, 71, -44)
console.log('Climbing to surface (302, 71, -44)...');
await lib.goTo(302, 71, -44, 1, { dig: true });
console.log('Surface reached:', lib.fmt(bot.entity.position));

// Move to portal site (298, 72, -53)
await lib.goTo(298, 72, -53, 1, { dig: true });
console.log('At portal site:', lib.fmt(bot.entity.position));

// Check players
for (const p of Object.values(bot.players)) {
  if (p.username !== 'gamma' && p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}`);
  }
}

// Check portal frame and portal block
let obsCount = 0;
let isLit = false;
for (let y = 72; y <= 76; y++) {
  for (let x = 298; x <= 301; x++) {
    const b = bot.blockAt(new Vec3(x, y, -54));
    if (b) {
      if (b.name === 'obsidian') obsCount++;
      if (b.name === 'nether_portal') isLit = true;
    }
  }
}

console.log(`Portal status: ${obsCount}/10 obsidian placed. Lit: ${isLit}`);
bot.chat(`gamma at portal site! Obs: ${obsCount}/10, Lit: ${isLit}!`);
