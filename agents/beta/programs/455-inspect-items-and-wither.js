// programs/455-inspect-items-and-wither.js
console.log('=== Step: Inspect Item and Wither Skeleton ===');

// 1. All entities within 20m
for (const e of Object.values(bot.entities)) {
  const d = bot.entity.position.distanceTo(e.position);
  if (d < 20) {
    if (e.name === 'item') {
      // Find item details from metadata or try parse
      console.log(`Item at ${lib.fmt(e.position)} (dist ${d.toFixed(1)}m):`, JSON.stringify(e.metadata));
    } else if (e.type === 'mob') {
      console.log(`Mob ${e.name} at ${lib.fmt(e.position)} (dist ${d.toFixed(1)}m), HP: ${e.health}`);
    }
  }
}

// 2. Chat history from teammates
console.log('Teammates check done.');
