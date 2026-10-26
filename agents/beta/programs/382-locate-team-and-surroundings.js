// programs/382-locate-team-and-surroundings.js
console.log('=== Step: Locate team and check base surroundings ===');
console.log('Beta pos:', lib.fmt(bot.entity.position));

// 1. List all players and their positions/equipment
for (const [name, player] of Object.entries(bot.players)) {
  if (player.entity) {
    const pos = player.entity.position;
    const held = player.entity.heldItem?.name;
    const dist = bot.entity.position.distanceTo(pos).toFixed(1);
    console.log(`Player ${name}: pos=${lib.fmt(pos)}, dist=${dist}m, held=${held}`);
  } else {
    console.log(`Player ${name}: (no entity in range)`);
  }
}

// 2. Scan for all furnaces within 10 blocks
const furnaceIds = [mcData.blocksByName.furnace?.id, mcData.blocksByName.blast_furnace?.id, mcData.blocksByName.smoker?.id].filter(Boolean);
const furnaces = bot.findBlocks({
  matching: furnaceIds,
  maxDistance: 10,
  count: 10
});
console.log(`Furnaces found (${furnaces.length}):`);
for (const p of furnaces) {
  const b = bot.blockAt(p);
  console.log(`  Furnace at ${lib.fmt(p)}: type=${b?.name}`);
}

// 3. Scan for nearby animals North of base
const animals = Object.values(bot.entities).filter(e => 
  ['sheep', 'cow', 'pig', 'chicken'].includes(e.name) && 
  bot.entity.position.distanceTo(e.position) < 40
);
console.log(`Animals within 40m (${animals.length}):`);
for (const a of animals) {
  console.log(`  ${a.name} at ${lib.fmt(a.position)}, dist=${bot.entity.position.distanceTo(a.position).toFixed(1)}m`);
}

// 4. Check for dropped items nearby
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 15
);
console.log(`Dropped items within 15m (${drops.length}):`);
for (const d of drops) {
  console.log(`  Item drop at ${lib.fmt(d.position)}`);
}
