// programs/894-coordinate-portal-reignite.js
console.log('=== Program 894: Coordinate Portal Reignite & Enderman Hunt ===');

const p = bot.entity.position;
console.log(`Beta pos: ${lib.fmt(p)}, HP: ${bot.health}, Food: ${bot.food}`);

// Chat to team to ignite the Nether portal frame at (46, 66, 2)
bot.chat('Beta: Portal frame at (46, 66, 2) was blown out by Ghast! Alpha/Delta/Gamma, please strike sill with flint & steel!');

// Scan for nearby teammates
for (const [name, pl] of Object.entries(bot.players)) {
  if (name === bot.username) continue;
  if (pl && pl.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(pl.entity.position)}, held: ${pl.entity.heldItem ? pl.entity.heldItem.name : 'empty'}`);
  }
}

// Scan for Endermen in Soul Sand Valley
const endermen = Object.values(bot.entities).filter(e =>
  e.isValid &&
  e.name === 'enderman' &&
  p.distanceTo(e.position) <= 48
);
console.log(`Endermen detected in Soul Sand Valley near Portal Camp: ${endermen.length}`);
for (const end of endermen) {
  console.log(`  Enderman at ${lib.fmt(end.position)} (dist: ${p.distanceTo(end.position).toFixed(1)}m)`);
}

// Scan for Piglins
const piglins = Object.values(bot.entities).filter(e =>
  e.isValid &&
  e.name === 'piglin' &&
  p.distanceTo(e.position) <= 32
);
console.log(`Piglins detected: ${piglins.length}`);
for (const pig of piglins) {
  console.log(`  Piglin at ${lib.fmt(pig.position)} (dist: ${p.distanceTo(pig.position).toFixed(1)}m)`);
}

// Check if nether_portal block appears
const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
console.log(`Active nether_portal blocks: ${portals.length}`);

return {
  hp: bot.health,
  food: bot.food,
  portals: portals.length,
  endermen: endermen.length,
  piglins: piglins.length
};
