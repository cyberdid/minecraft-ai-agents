// programs/210-pickup-item-pile.js
console.log('--- PICK UP DROPPED ITEMS AT (305, 72, -38) ---');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Exit base through door
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  const d = bot.blockAt(new Vec3(294, 72, -54));
  if (d) await bot.activateBlock(d);
  await lib.walkTo(294.5, -52.0, 2000);
}

// 2. Walk to the item pile at (305, 72, -38)
console.log('Walking to item pile at (305, 72, -38)...');
try {
  await lib.goTo(305, 72, -38, 1, { timeoutMs: 15000 });
} catch (e) {
  await lib.goToXZ(305, -38, { timeoutMs: 10000 });
}

// Pick up items in an 8-block radius
console.log('Picking up items...');
await lib.pickup(8);

// Walk around the pile to get all 14 items
for (const [dx, dz] of [[0, 0], [2, 0], [-2, 0], [0, 2], [0, -2], [2, -2]]) {
  try {
    await lib.walkTo(305 + dx, -38 + dz, 2000);
    await lib.pickup(4);
  } catch (e) {}
}

console.log('Inventory after pickup:', JSON.stringify(lib.inv()));

// 3. Return to base
console.log('Returning to base at (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 12000 });
} catch (e) {
  await lib.goToXZ(294, -53, { timeoutMs: 8000 });
}

try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
try { await lib.door(294, 72, -54, false); } catch (e) {}

console.log('Safely inside base!');
console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Final HP:', bot.health, 'Food:', bot.food);

// Equip armor if picked up!
await lib.equipArmor();
await lib.equipWeapon();

bot.chat(`gamma recovered items! Inv: ${JSON.stringify(lib.inv())}. HP: ${bot.health}/20.`);
