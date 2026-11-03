// programs/825-gravel-head-drop.js
console.log('=== Program 825: Gravel Head Drop Reset ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

const gravel = bot.inventory.items().find(i => i.name === 'gravel');
if (!gravel) {
  console.log('No gravel found in inventory!');
} else {
  await bot.equip(gravel, 'hand');
  
  // Find reference block at x=45, y=32, z=-125
  const ref = bot.blockAt(new Vec3(45, 32, -125));
  console.log('Reference block at (45, 32, -125):', ref?.name);
  
  if (ref && ref.boundingBox === 'block') {
    console.log('Placing gravel against ref block facing +X (towards Alpha)...');
    try {
      await bot.placeBlock(ref, new Vec3(1, 0, 0));
      console.log('Gravel placed successfully at (46, 32, -125)!');
    } catch (e) {
      console.log('placeBlock error:', e.message);
    }
  } else {
    // If ref at y=32 is not solid, check y=31
    const ref31 = bot.blockAt(new Vec3(45, 31, -125));
    console.log('Reference block at (45, 31, -125):', ref31?.name);
    if (ref31 && ref31.boundingBox === 'block') {
      try {
        await bot.placeBlock(ref31, new Vec3(1, 0, 0));
        console.log('Gravel placed at (46, 31, -125)!');
      } catch (e) {
        console.log('placeBlock 31 error:', e.message);
      }
    }
  }
}

// Wait for suffocation damage and respawn
console.log('Waiting for respawn in Overworld...');
const start = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - start < 12000) {
  await sleep(250);
}

console.log(`Current dim: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);
