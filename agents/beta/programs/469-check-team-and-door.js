// programs/469-check-team-and-door.js
console.log('=== Step: Check Team & Base Surroundings ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Night in:', bot.time.nightIn);

// 1. Check all players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  } else {
    console.log(`Player ${name} entity not loaded`);
  }
}

// 2. Collect 4 logs from nearby tree using lib.collect('*_log', 4)
if (lib.count('*_log') < 3 && lib.count('*_planks') < 6) {
  try {
    // Open door first if inside
    await lib.goThroughDoor(294, 72, -54, { close: false });
    console.log('Went outside to collect logs...');
    const gained = await lib.collect('*_log', 4);
    console.log('Collected logs:', JSON.stringify(gained));
    // Step back inside
    await lib.goThroughDoor(294, 72, -54, { close: false });
  } catch (e) {
    console.log('Collect error:', e.message);
  }
}

console.log('Inv:', JSON.stringify(lib.inv()));
