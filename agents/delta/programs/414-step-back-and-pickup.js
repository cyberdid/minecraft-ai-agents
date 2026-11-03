// programs/414-step-back-and-pickup.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'food:', bot.food);

// 1. Move back down the covered bridge to (42, 65, -176)
console.log('Stepping back to safe bridgehead at (42, 65, -176)...');
try {
  await lib.goTo(42, 65, -176, 1, { timeoutMs: 6000 });
} catch (e) {
  console.log('goTo bridge note:', e.message);
  await bot.lookAt(new Vec3(42.5, 65.0, -176.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

console.log('Arrived at bridgehead! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 2. Pick up the dropped item at (42, 65, -176)
const p = await lib.pickup(6);
console.log(`Picked up ${p} items!`);

// Print inventory
console.log('Inventory now:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
