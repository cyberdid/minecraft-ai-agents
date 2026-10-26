// programs/115-check-surroundings-and-chat.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// Nearby players
console.log('Nearby players:');
for (const name in bot.players) {
  const p = bot.players[name];
  if (p && p.entity && p !== bot.player) {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`- ${name}: dist ${d.toFixed(1)}m at ${lib.fmt(p.entity.position)} (held: ${p.entity.heldItem?.name || 'none'})`);
  }
}

// Nearby items on ground
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 16);
console.log(`Nearby items on ground (${items.length}):`);
for (const it of items) {
  const d = bot.entity.position.distanceTo(it.position);
  console.log(`- item at ${lib.fmt(it.position)} dist ${d.toFixed(1)}m`);
}

// Nearby hostiles
const hostiles = Object.values(bot.entities).filter(e => (e.type === 'mob' || e.type === 'hostile') && bot.entity.position.distanceTo(e.position) < 32);
console.log(`Nearby hostiles (${hostiles.length}):`);
for (const h of hostiles) {
  const d = bot.entity.position.distanceTo(h.position);
  console.log(`- ${h.name} at ${lib.fmt(h.position)} dist ${d.toFixed(1)}m hp:${h.metadata?.[9] || '?'}`);
}

// Look at blocks around the bunker and staircase entrance
console.log('Blocks at bunker doorway:');
const checkCoords = [
  new Vec3(44, 65, -128),
  new Vec3(44, 66, -128),
  new Vec3(44, 67, -128),
  new Vec3(44, 65, -129),
  new Vec3(44, 64, -130),
  new Vec3(44, 63, -131),
  new Vec3(44, 62, -132),
  new Vec3(44, 61, -133),
  new Vec3(45, 65, -128),
  new Vec3(45, 66, -128)
];
for (const c of checkCoords) {
  console.log(`Block at ${lib.fmt(c)}: ${bot.blockAt(c)?.name}`);
}

console.log('Inventory:', JSON.stringify(lib.inv()));
