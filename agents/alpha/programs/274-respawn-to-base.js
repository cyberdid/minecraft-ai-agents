// programs/274-respawn-to-base.js
console.log('=== Program 274: Return to Base Spawn ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// Place block at head position to suffocate and respawn at base
const headPos = bot.entity.position.floored().offset(0, 1, 0);
console.log('Head pos:', lib.fmt(headPos));

// Check if we have cobblestone
const item = bot.inventory.items().find(i => i.name === 'cobblestone');
if (item) {
  await bot.equip(item, 'hand');
  // Place block against adjacent wall at head pos
  const refBlock = bot.blockAt(headPos.offset(0, 0, 1)) || bot.blockAt(headPos.offset(1, 0, 0)) || bot.blockAt(headPos.offset(0, 1, 0));
  if (refBlock) {
    console.log(`Placing cobblestone against ${refBlock.name} at ${lib.fmt(refBlock.position)}...`);
    try {
      await bot.placeBlock(refBlock, new Vec3(0, -1, 0));
    } catch (e) {
      console.log('placeBlock note:', e.message);
    }
  }
}

// Wait up to 10s for respawn
for (let i = 0; i < 10; i++) {
  if (bot.health >= 15) {
    console.log('Respawned with full health! Pos:', lib.fmt(bot.entity.position));
    break;
  }
  await sleep(1000);
}

console.log('Current pos:', lib.fmt(bot.entity.position), 'Health:', bot.health);
