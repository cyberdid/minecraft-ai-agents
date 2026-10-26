// programs/011-portal-and-food.js
console.log('gamma at:', lib.fmt(bot.entity.position));

// Step outside door
await lib.door(294, 72, -54, true);
await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -53));
await lib.door(294, 72, -54, false);

console.log('Outside base at:', lib.fmt(bot.entity.position));

// Check portal site (298, 72, -54)
const portalBlocks = [];
for (let y = 72; y <= 76; y++) {
  for (let x = 298; x <= 301; x++) {
    const b = bot.blockAt(new Vec3(x, y, -54));
    portalBlocks.push(`${x},${y}: ${b ? b.name : 'null'}`);
  }
}
console.log('Portal site blocks:\n' + portalBlocks.join('\n'));

// Check nearby animals
const animals = Object.values(bot.entities)
  .filter(e => e.name && ['cow', 'sheep', 'pig', 'chicken'].includes(e.name) && e.position)
  .map(e => ({ name: e.name, pos: lib.fmt(e.position), dist: e.position.distanceTo(bot.entity.position).toFixed(1) }));
console.log('Nearby peaceful mobs:', JSON.stringify(animals));

// Check players
for (const p of Object.values(bot.players)) {
  if (p.username !== 'gamma' && p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}`);
  }
}
