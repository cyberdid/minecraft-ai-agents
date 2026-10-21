console.log("bot.inventory slots:");
bot.inventory.slots.forEach((item, index) => {
  if (item) {
    console.log(`Slot ${index}: ${item.name} x${item.count}`);
  }
});

console.log("Held item:", bot.heldItem ? `${bot.heldItem.name}x${bot.heldItem.count}` : "none");
console.log("Current window:", bot.currentWindow ? bot.currentWindow.type : "none");

// Also check if any items were dropped around
const drops = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 8);
console.log(`Nearby item entities: ${drops.length}`);
for (const d of drops) {
  console.log(`- item drop at ${d.position.floored()}`);
}
