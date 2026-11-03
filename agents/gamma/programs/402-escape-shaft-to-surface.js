// programs/402-escape-shaft-to-surface.js
console.log('=== ESCAPE SHAFT & TOWER TO SURFACE ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));

// 1. Check surrounding blocks
const pos = bot.entity.position;
console.log(`Current position: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`);

// 2. Tower straight up to y=72 using cobblestone
console.log('Towering straight up to surface (y=72)...');
const targetY = 72;

while (bot.entity.position.y < targetY && !isCancelled()) {
  const currentY = Math.floor(bot.entity.position.y);
  
  // Clear any blocks above head (y+2, y+3)
  for (let dy = 2; dy <= 3; dy++) {
    const headBlock = bot.blockAt(new Vec3(Math.floor(bot.entity.position.x), currentY + dy, Math.floor(bot.entity.position.z)));
    if (headBlock && headBlock.boundingBox === 'block' && headBlock.name !== 'nether_portal') {
      console.log(`Clearing block above head at y=${currentY + dy}: ${headBlock.name}`);
      try { await bot.dig(headBlock); } catch (e) {}
    }
  }

  // Jump and place cobblestone under feet
  const placePos = new Vec3(Math.floor(bot.entity.position.x), currentY, Math.floor(bot.entity.position.z));
  bot.setControlState('jump', true);
  await sleep(250);
  bot.setControlState('jump', false);
  
  try {
    await lib.place('cobblestone', placePos.x, placePos.y, placePos.z);
    console.log(`Placed cobblestone underfoot at y=${placePos.y}. Pos now: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    // If lib.place failed, try raw placement
    try {
      const blockBelow = bot.blockAt(placePos.offset(0, -1, 0));
      if (blockBelow) {
        await bot.equip(mcData.itemsByName.cobblestone.id, 'hand');
        await bot.placeBlock(blockBelow, new Vec3(0, 1, 0));
      }
    } catch (e2) {}
  }
  await sleep(150);
}

console.log('Ascended! Pos now:', lib.fmt(bot.entity.position));

// 3. Move into base shelter to heal safely
console.log('Moving into base shelter at (294, 72, -54)...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true, timeoutMs: 10000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base shelter!');
  bot.chat('gamma: Escaped underground shaft! Safely inside base shelter at ' + lib.fmt(bot.entity.position));
} catch (e) {
  console.log('goTo base note:', e.message);
}

await lib.equipWeapon();
console.log('Ending inventory:', JSON.stringify(lib.inv()));
console.log('Ending status:', JSON.stringify(lib.status()));
