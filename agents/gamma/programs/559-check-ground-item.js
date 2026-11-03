// programs/559-check-ground-item.js
console.log('Item with ID 15 in mcData:', mcData.items[15] || mcData.blocks[15]);

// Let's go pick it up!
console.log('Moving to (292, 70, -55) to pickup item...');
try {
  await lib.goTo(292, 71, -55, 1.0, { timeoutMs: 5000 });
} catch (e) {}
await lib.pickup(3.0);
console.log('Inventory now:', lib.inv());
