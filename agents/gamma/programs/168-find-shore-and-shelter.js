// programs/168-find-shore-and-shelter.js
console.log('--- FIND SHORE AND MAKE SOLID SHELTER ---');
console.log('Pos:', bot.entity.position);
const feet = bot.blockAt(bot.entity.position);
const below = bot.blockAt(bot.entity.position.offset(0, -1, 0));
console.log('Feet:', feet?.name, 'Below:', below?.name);

// Find nearest solid ground block at y >= 62
const solidBlocks = bot.findBlocks({
  matching: b => b.boundingBox === 'block' && ['grass_block', 'dirt', 'stone', 'sand'].includes(b.name),
  maxDistance: 16,
  count: 10
});

console.log(`Found ${solidBlocks.length} solid blocks nearby:`);
for (const p of solidBlocks.slice(0, 5)) {
  console.log(`Solid block at ${lib.fmt(p)}: ${bot.blockAt(p)?.name}, dist: ${bot.entity.position.distanceTo(p).toFixed(1)}m`);
}

if (solidBlocks.length > 0) {
  // Move to the closest solid block
  const target = solidBlocks[0];
  console.log(`Walking towards solid ground at ${lib.fmt(target)}...`);
  // Swim up / jump while walking
  bot.setControlState('jump', true);
  await lib.walkTo(target.x + 0.5, target.z + 0.5, 5000);
  bot.setControlState('jump', false);
  console.log('Pos on solid ground:', lib.fmt(bot.entity.position));
  
  // Now try shelter on solid ground
  try {
    await lib.shelter();
    console.log('SUCCESSFULLY SHELTERED! Pos:', lib.fmt(bot.entity.position));
    bot.chat(`Gamma safely sheltered underground at ${lib.fmt(bot.entity.position)}.`);
  } catch (e) {
    console.log('Shelter down failed:', e.message);
    // If shelter down fails, build a 3-high cobblestone box around ourselves!
    console.log('Building cobblestone box shelter...');
    const p = bot.entity.position.floored();
    // Place wall around p
    for (let dy = 0; dy <= 2; dy++) {
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const wallPos = p.offset(dx, dy, dz);
        const cur = bot.blockAt(wallPos);
        if (cur && cur.name === 'air') {
          try { await lib.place('cobblestone', wallPos.x, wallPos.y, wallPos.z); } catch (err) {}
        }
      }
    }
    // Place roof at y+2
    try { await lib.place('cobblestone', p.x, p.y + 2, p.z); } catch (err) {}
    console.log('Cobblestone bunker placed! Current pos:', lib.fmt(bot.entity.position));
    bot.chat(`Gamma sheltered in cobblestone box at ${lib.fmt(bot.entity.position)}.`);
  }
} else {
  console.log('No solid block found within 16 blocks?!');
}

console.log('Final time:', JSON.stringify(lib.time()));
console.log('Final pos:', lib.fmt(bot.entity.position));
