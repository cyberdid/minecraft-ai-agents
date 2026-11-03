console.log('=== TOWER UP TO Y=72 & STEP OUT ===');
console.log('Current pos:', lib.fmt(bot.entity.position));

// Tower up if below y=71.8
while (bot.entity.position.y < 71.8 && !isCancelled()) {
  const p = bot.entity.position.floored();
  console.log(`At y=${bot.entity.position.y.toFixed(1)}, jumping and placing cobblestone underfoot...`);
  bot.setControlState('jump', true);
  await sleep(350);
  try {
    await lib.place('cobblestone', p.x, p.y, p.z);
  } catch (e) {
    console.log('Tower place note:', e.message);
  }
  bot.setControlState('jump', false);
  await sleep(300);
}

console.log('Pos after tower:', lib.fmt(bot.entity.position));

// Pickup any dropped items on floor (e.g. Beta bucket)
try {
  await lib.pickup(5);
} catch (e) {}

// Walk to inside of door at (293, 72, -54)
try {
  await bot.pathfinder.goto(new goals.GoalBlock(293, 72, -54));
} catch (e) {}

// Open door if closed
const door = bot.blockAt(new Vec3(294, 72, -54));
if (door) {
  const isOpen = door._properties?.open === 'true' || door._properties?.open === true;
  if (!isOpen) {
    await bot.activateBlock(door);
    await sleep(250);
  }
}

// Step through door to (295, 72, -54)
try {
  await bot.pathfinder.goto(new goals.GoalBlock(295, 72, -54));
} catch (e) {
  bot.setControlState('forward', true);
  await sleep(500);
  bot.setControlState('forward', false);
}

// Walk outside to (299, 73, -52)
try {
  await bot.pathfinder.goto(new goals.GoalNear(299.0, 73.0, -52.0, 0.6));
} catch (e) {}

console.log('Stationed at portal: pos =', lib.fmt(bot.entity.position));

// Check if we picked up the bucket
console.log('Delta inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Sill (299, 72, -54): ${sill ? sill.name : 'null'}`);

return { pos: bot.entity.position, inv: lib.inv() };
