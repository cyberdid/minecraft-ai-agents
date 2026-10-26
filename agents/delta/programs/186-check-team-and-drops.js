// programs/186-check-team-and-drops.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// 1. Check nearby entities (players, items, etc.)
console.log('--- NEARBY ENTITIES (<32m) ---');
for (const id in bot.entities) {
  const e = bot.entities[id];
  if (!e || e === bot.entity) continue;
  const dist = bot.entity.position.distanceTo(e.position);
  if (dist < 32) {
    if (e.type === 'player') {
      console.log(`Player ${e.username}: pos=${lib.fmt(e.position)}, dist=${dist.toFixed(1)}m, held=${e.heldItem?.name || 'none'}`);
      // Check equipment
      if (e.equipment) {
        console.log(`  equipment:`, e.equipment.map(item => item?.name).filter(Boolean));
      }
    } else if (e.name === 'item') {
      const item = e.getDroppedItem?.();
      console.log(`Item drop at ${lib.fmt(e.position)}, dist=${dist.toFixed(1)}m: ${item?.name} x${item?.count}`);
    } else {
      console.log(`Entity: ${e.name || e.type} at ${lib.fmt(e.position)}, dist=${dist.toFixed(1)}m`);
    }
  }
}

// 2. Check time
const t = lib.time();
console.log('Time info:', JSON.stringify(t));

// 3. Chat with team
bot.chat('Delta: Base regroup. Night in ' + Math.round(t.secondsUntilNight) + 's. Let us sleep when dusk falls, then harvest wood and iron for shields!');
