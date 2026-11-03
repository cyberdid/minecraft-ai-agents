console.log('=== Lock Spawn & Check Base ===');
console.log('Bot pos:', lib.fmt(bot.entity.position));

// Lock spawn point at Bed 2
try {
  await lib.setSpawn();
  console.log('SUCCESS: SPAWN POINT LOCKED AT BED!');
  bot.chat('beta: Spawn point permanently locked at base bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
  const beds = bot.findBlocks({ matching: b => b.name.includes('bed'), maxDistance: 5 });
  if (beds.length > 0) {
    const b = bot.blockAt(beds[0]);
    await bot.activateBlock(b);
    console.log('Activated bed directly at', beds[0]);
  }
}

// Make sure base door is closed so no mobs can enter
try {
  await lib.door(294, 72, -54, false);
  console.log('Base door closed!');
} catch (e) {}

// Check health and food
console.log('Health:', bot.health, 'Food:', bot.food);
