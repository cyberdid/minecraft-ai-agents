console.log('=== CLEAN EXIT TO PORTAL ===');

// Step 1: Walk to inside side of door at (293, 72, -54)
try {
  await bot.pathfinder.goto(new goals.GoalBlock(293, 72, -54));
} catch (e) {}

// Step 2: Open door if closed
const door = bot.blockAt(new Vec3(294, 72, -54));
if (door) {
  const isOpen = door._properties?.open === 'true' || door._properties?.open === true;
  console.log(`Door isOpen: ${isOpen}`);
  if (!isOpen) {
    console.log('Activating door to open it...');
    await bot.activateBlock(door);
    await sleep(300);
  }
}

// Step 3: Step through door to (295, 72, -54)
try {
  await bot.pathfinder.goto(new goals.GoalBlock(295, 72, -54));
} catch (e) {
  bot.setControlState('forward', true);
  await sleep(600);
  bot.setControlState('forward', false);
}

// Step 4: Walk outside to portal frame at (299, 73, -52)
try {
  await bot.pathfinder.goto(new goals.GoalNear(299.0, 73.0, -52.0, 0.6));
} catch (e) {}

console.log('Delta pos now:', lib.fmt(bot.entity.position));

const sill = bot.blockAt(new Vec3(299, 72, -54));
const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
console.log(`Sill: ${sill?.name}, Portal: ${portal ? 'ACTIVE' : 'none'}`);

