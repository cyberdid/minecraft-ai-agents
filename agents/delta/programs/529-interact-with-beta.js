// programs/529-interact-with-beta.js
console.log('=== DELTA: INTERACT WITH BETA & BASE AUDIT ===');

const beta = bot.players['beta'];
if (beta && beta.entity) {
  console.log(`Beta equipment:`, JSON.stringify(beta.entity.equipment));
  bot.chat('delta: Beta! I am at base with 12.8 HP, 7 food. Do you have any spare food or gold ingots?');
} else {
  console.log('Beta entity not found.');
}

// Check all containers in base
const chests = bot.findBlocks({ matching: b => b && ['chest', 'trapped_chest', 'barrel'].includes(b.name), maxDistance: 10 });
console.log(`Chests found in base: ${chests.length}`);
for (const cp of chests) {
  console.log(`Chest at ${lib.fmt(cp)}`);
}

// Check beds
const beds = bot.findBlocks({ matching: b => b && b.name.includes('bed'), maxDistance: 10 });
console.log(`Beds found: ${beds.length}`);
for (const bp of beds) {
  console.log(`Bed at ${lib.fmt(bp)}`);
}

// Set spawn at bed
if (beds.length > 0) {
  try {
    console.log(`Setting spawn at bed ${lib.fmt(beds[0])}...`);
    await lib.setSpawn(beds[0].x, beds[0].y, beds[0].z);
    console.log('Spawn set successfully!');
  } catch (e) {
    console.log('setSpawn notice:', e.message);
  }
}

return { chests: chests.length, beds: beds.length };
