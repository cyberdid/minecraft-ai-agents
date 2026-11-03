// programs/835-check-portal-and-players.js
console.log('=== Program 835: Check Portal & Players ===');
globalThis.isProgramCancelled = isCancelled;

const p = bot.entity.position;
console.log(`Current pos: ${lib.fmt(p)}, dimension: ${bot.game.dimension}`);

// Check other players
for (const [name, entity] of Object.entries(bot.players)) {
  if (name === bot.username) continue;
  if (entity && entity.entity) {
    const epos = entity.entity.position;
    console.log(`Player ${name}: at ${lib.fmt(epos)} (dist: ${p.distanceTo(epos).toFixed(1)}m)`);
  } else {
    console.log(`Player ${name}: not in visual range or different dimension`);
  }
}

// Check portal frame
const portalCoords = [
  new Vec3(299, 72, -54),
  new Vec3(300, 72, -54),
  new Vec3(299, 73, -54),
  new Vec3(300, 73, -54),
  new Vec3(299, 74, -54),
  new Vec3(300, 74, -54),
];

console.log('Portal blocks status:');
for (const c of portalCoords) {
  const b = bot.blockAt(c);
  console.log(`  ${lib.fmt(c)}: ${b ? b.name : 'null'}`);
}

const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 64,
  count: 10
});
console.log(`Nether portal blocks found within 64m: ${portals.length}`);

// Return to base area
if (bot.game.dimension === 'overworld' && p.distanceTo(new Vec3(294, 72, -55)) > 5) {
  console.log('Navigating back to base (294, 72, -55)...');
  try {
    await lib.goTo(294, 72, -55, 2, { timeoutMs: 15000 });
  } catch (e) {
    console.log(`goTo base warning: ${e.message}`);
  }
}

console.log(`Final pos: ${lib.fmt(bot.entity.position)}`);
