// programs/298-unite-with-alpha-at-ridge.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// Dimension guard
if (!String(bot.game.dimension).includes('nether')) {
  console.log('Not in Nether! Aborting.');
  return;
}

bot.pathfinder.stop();
await sleep(100);

// Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    const dist = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist: ${dist.toFixed(1)}m, HP: ${p.entity.metadata?.[9] ?? '?'})`);
  }
}

// 1. Safe bunker exit strictly at z = -8.0
console.log('Exiting bunker at z=-8.0...');
await lib.walkTo(40.5, -8.0, 2000);
bot.clearControlStates();
console.log('Safe bunker exit at:', lib.fmt(bot.entity.position));

bot.chat('delta: In Nether bunker, moving East along cleared z=-8 trail to unite with Alpha at (63, 65, -8)!');

// 2. Follow z = -8.0 to East Ridge Head (63, 65, -8)
const toRidge = [
  new Vec3(48, 65, -8),
  new Vec3(56, 65, -8),
  new Vec3(63, 65, -8)
];

for (const wp of toRidge) {
  if (!String(bot.game.dimension).includes('nether')) return;
  console.log(`Walking to waypoint ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1, { timeoutMs: 12000 });
  } catch (e) {
    console.log(`goTo note for ${lib.fmt(wp)}:`, e.message);
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 8000 });
    } catch (e2) {}
  }
  
  // Pick up any dropped items on the way
  try {
    await lib.pickup(6);
  } catch (e) {}
}

console.log('Reached East Ridge Head! Pos:', lib.fmt(bot.entity.position));

// Check nearby drops
const drops = Object.values(bot.entities).filter(e => e && (e.name === 'item' || e.type === 'object') && bot.entity.position.distanceTo(e.position) < 15);
console.log(`Drops within 15m: ${drops.length}`);
for (const d of drops) {
  console.log(`Drop at ${lib.fmt(d.position)} (dist: ${bot.entity.position.distanceTo(d.position).toFixed(1)}m)`);
  if (bot.entity.position.distanceTo(d.position) < 8) {
    try {
      await lib.pickup(8);
    } catch (e) {}
  }
}

// Equip best weapon/armor if picked up
try {
  await lib.equipArmor();
  await lib.equipWeapon();
} catch (e) {}

console.log('Current Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
