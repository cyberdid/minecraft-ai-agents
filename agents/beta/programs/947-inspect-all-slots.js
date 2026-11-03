console.log('=== Program 947: Inspect All Slots and Check Other Teammates ===');
globalThis.isProgramCancelled = isCancelled;

console.log('--- Beta Inventory Slots ---');
for (let i = 0; i < bot.inventory.slots.length; i++) {
  const item = bot.inventory.slots[i];
  if (item) {
    console.log(`Slot ${i}: ${item.name} x${item.count}`);
  }
}

console.log('--- Teammates Nearby ---');
for (const p of Object.values(bot.players)) {
  if (p.entity && p.username !== bot.username) {
    console.log(`${p.username}: pos=${lib.fmt(p.entity.position)}, held=${p.entity.heldItem ? p.entity.heldItem.name : 'none'}`);
  }
}

// Check recipe for ender_eye
console.log('Recipe for ender_eye:');
console.log(lib.recipe('ender_eye'));

return {
  ender_eyes: lib.count('ender_eye'),
  ender_pearls: lib.count('ender_pearl'),
  blaze_powder: lib.count('blaze_powder')
};
