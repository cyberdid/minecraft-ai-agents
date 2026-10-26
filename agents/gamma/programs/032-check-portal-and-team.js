// programs/032-check-portal-and-team.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// Go to portal site at (298, 72, -54)
console.log('Moving to portal site at (298, 72, -54)...');
try {
  await lib.goTo(298, 72, -53, 1, { dig: true });
} catch (e) {
  console.log('GoTo portal site error:', e.message);
}

console.log('At portal site:', lib.fmt(bot.entity.position));

// Check players
for (const p of Object.values(bot.players)) {
  if (p.username !== 'gamma' && p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}`);
  }
}

// Check portal frame
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
console.log(`Portal frame: ${obsCount}/10 obsidian placed. Lit: ${isLit}`);

bot.chat(`gamma at portal site (298, 72, -54) with cooked_beef ready! Portal: ${obsCount}/10 obsidian. Lit: ${isLit}`);
