// programs/701-inspect-stronghold-blocks.js
console.log('=== STRONGHOLD SURVEY ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// Find end portal frames or portals
const endPortalFrames = bot.findBlocks({
  matching: b => b && (b.name === 'end_portal_frame' || b.name === 'end_portal'),
  maxDistance: 32,
  count: 32
});

console.log(`Found ${endPortalFrames.length} end portal frame/portal blocks:`);
for (const p of endPortalFrames) {
  const b = bot.blockAt(p);
  console.log(`Block ${b?.name} at ${lib.fmt(p)}, hasEye=${b?._properties?.eye}`);
}

// Find spawners
const spawners = bot.findBlocks({
  matching: b => b && b.name === 'spawner',
  maxDistance: 32
});
console.log(`Found ${spawners.length} spawners:`);
for (const s of spawners) {
  console.log(`Spawner at ${lib.fmt(s)}`);
}

// Find stone bricks / stronghold corridors
const stoneBricks = bot.findBlocks({
  matching: b => b && b.name.includes('stone_brick'),
  maxDistance: 16,
  count: 10
});
console.log(`Found ${stoneBricks.length} stone brick blocks nearby.`);

// Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (name === bot.username) continue;
  if (p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

return {
  portalFrames: endPortalFrames.length,
  spawners: spawners.length,
  stoneBricks: stoneBricks.length
};
