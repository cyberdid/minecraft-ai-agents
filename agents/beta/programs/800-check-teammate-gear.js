// programs/800-check-teammate-gear.js
console.log('=== Program 800: Check Teammate Gear & Bed Status ===');
const alpha = bot.nearestEntity(e => e.type === 'player' && e.username === 'alpha');
const delta = bot.nearestEntity(e => e.type === 'player' && e.username === 'delta');

if (alpha) {
  console.log('Alpha held item:', alpha.heldItem?.name);
}
if (delta) {
  console.log('Delta held item:', delta.heldItem?.name);
}

// Ask in chat about bed and food
bot.chat('Beta: Alpha/Delta, do you have a 2nd bed in your inventory? Night is in 80s!');

// Also check if we can craft wheat/bread with bone meal
console.log('Bones in inventory:', lib.count('bone'));
if (lib.count('bone') > 0) {
  try {
    await lib.craft('bone_meal', lib.count('bone') * 3);
    console.log('Crafted bone meal:', lib.count('bone_meal'));
  } catch (e) {
    console.log('Craft bone_meal notice:', e.message);
  }
}

// Check time
console.log('Time:', bot.time.timeOfDay, 'canSleep:', lib.time().canSleep);
