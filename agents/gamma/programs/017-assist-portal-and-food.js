// programs/017-assist-portal-and-food.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// Step outside door
await lib.door(294, 72, -54, true);
await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -53));
await lib.door(294, 72, -54, false);

// Check players
for (const p of Object.values(bot.players)) {
  if (p.username !== 'gamma' && p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}`);
  }
}

// Check portal frame at (298, 72, -54)
const portalFrame = [];
let obsCount = 0;
let portalLit = false;
for (let y = 72; y <= 76; y++) {
  for (let x = 298; x <= 301; x++) {
    const b = bot.blockAt(new Vec3(x, y, -54));
    if (b) {
      if (b.name === 'obsidian') obsCount++;
      if (b.name === 'nether_portal') portalLit = true;
      if (b.name !== 'air') portalFrame.push(`${x},${y}: ${b.name}`);
    }
  }
}
console.log(`Portal frame: ${obsCount}/10 obsidian placed. Lit: ${portalLit}`);
console.log('Blocks:', portalFrame.join(', '));

// Check nearby animals
const animals = Object.values(bot.entities)
  .filter(e => e.name && ['cow', 'sheep', 'pig', 'chicken'].includes(e.name) && e.position)
  .map(e => ({ name: e.name, pos: lib.fmt(e.position), dist: e.position.distanceTo(bot.entity.position).toFixed(1) }));
console.log('Nearby peaceful mobs:', JSON.stringify(animals));

bot.chat(`gamma outside base at dawn. Portal frame: ${obsCount}/10 obsidian. Ready to assist!`);
