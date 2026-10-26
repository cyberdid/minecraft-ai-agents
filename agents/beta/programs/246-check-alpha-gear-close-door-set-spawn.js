// programs/246-check-alpha-gear-close-door-set-spawn.js
console.log('=== Step 4: Close door, inspect Alpha gear, set spawn ===');

// 1. Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
  console.log('Door closed.');
} catch (e) {
  console.log('Door note:', e.message);
}

// 2. Check Alpha equipment
const alpha = bot.players['alpha']?.entity;
if (alpha) {
  console.log('Alpha entity found:');
  const eq = alpha.equipment;
  if (eq) {
    console.log('Alpha equipment:', eq.map(it => it ? `${it.name} (slot)` : 'empty'));
  }
  if (alpha.heldItem) {
    console.log('Alpha held item:', alpha.heldItem.name);
  }
}

// 3. Inspect bed at (294, 72, -56)
const bedBlock = bot.blockAt(294, 72, -56);
console.log('Bed block at (294, 72, -56):', bedBlock?.name);

if (bedBlock && bedBlock.name.includes('bed')) {
  try {
    console.log('Setting spawn at bed...');
    await lib.setSpawn();
    console.log('Spawn set successfully!');
  } catch (e) {
    console.log('setSpawn note:', e.message);
  }
}

// 4. Update team notes & chat with Alpha
bot.chat('alpha: I died earlier in aquifer and lost diamond pick, bucket, flint & steel. Currently at base with stone tools, wood, cobblestone.');
