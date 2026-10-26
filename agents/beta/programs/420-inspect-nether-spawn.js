// programs/420-inspect-nether-spawn.js
console.log('=== Step: Inspect Nether portal spawn at (40, 65, -7) ===');
console.log('Current dimension:', bot.game.dimension);
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Locate portal blocks in the Nether
const portals = bot.findBlocks({
  matching: mcData.blocksByName.nether_portal.id,
  maxDistance: 6,
  count: 10
});
console.log(`Nether portal blocks found (${portals.length}):`);
for (const p of portals) {
  console.log(`  Portal block at ${lib.fmt(p)}`);
}

// 2. Scan immediate surroundings (4m box around bot)
const pos = bot.entity.position.floored();
console.log('Scanning blocks underfoot and around:');
for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    const floor = bot.blockAt(pos.offset(dx, -1, dz));
    const waist = bot.blockAt(pos.offset(dx, 0, dz));
    if (floor && floor.name !== 'air') {
      console.log(`  Floor at (${pos.x + dx}, ${pos.y - 1}, ${pos.z + dz}): ${floor.name}`);
    }
    if (waist && waist.name === 'lava') {
      console.log(`  WARNING: Lava at (${pos.x + dx}, ${pos.y}, ${pos.z + dz})!`);
    }
  }
}

// 3. Scan for hostiles in the Nether
const netherMobs = Object.values(bot.entities).filter(e => 
  ['ghast', 'blaze', 'piglin', 'zombified_piglin', 'wither_skeleton', 'magma_cube', 'hoglin'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) < 30
);
console.log(`Nether mobs within 30m (${netherMobs.length}):`);
for (const m of netherMobs) {
  console.log(`  ${m.name} at ${lib.fmt(m.position)}, dist=${bot.entity.position.distanceTo(m.position).toFixed(1)}m`);
}

// 4. Place a torch near the Nether portal to mark it clearly
try {
  await lib.placeTorch();
  console.log('Placed torch by Nether portal!');
} catch (e) {
  console.log('Torch note:', e.message);
}

bot.chat(`beta: In the Nether at ${lib.fmt(bot.entity.position)}! Found ${portals.length} portal blocks. Building cobblestone bunker.`);
