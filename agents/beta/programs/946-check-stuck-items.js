console.log('=== Program 946: Check Stuck Items / Recover Blaze Powder ===');
globalThis.isProgramCancelled = isCancelled;

try {
  await lib.stowCursor();
  console.log('Cursor stowed');
} catch (e) {
  console.log('stowCursor notice:', e.message);
}

try {
  await lib.clearCraftingGrid();
  console.log('Crafting grid cleared');
} catch (e) {
  console.log('clearCraftingGrid notice:', e.message);
}

// Check dropped items inside base
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 8);
console.log(`Dropped items on floor: ${items.length}`);
for (const it of items) {
  console.log(`  Dropped item at ${lib.fmt(it.position)}`);
}

await lib.pickup(6.0);

console.log('Current Inventory:', JSON.stringify(lib.inv()));
console.log('Blaze powder:', lib.count('blaze_powder'));
console.log('Ender eye:', lib.count('ender_eye'));
console.log('Ender pearl:', lib.count('ender_pearl'));

return {
  ender_eye: lib.count('ender_eye'),
  blaze_powder: lib.count('blaze_powder'),
  ender_pearl: lib.count('ender_pearl'),
  inv: lib.inv()
};
