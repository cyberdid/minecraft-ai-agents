// programs/510-craft-tools-and-enter-nether.js
console.log('=== Program 510: Craft Gear, Enter Nether & Secure Frontline ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));

// 1. Craft stone tools if needed
if (!lib.count('stone_pickaxe') || lib.count('stone_sword') < 2) {
  console.log('Crafting stone tools...');
  if (lib.count('stick') < 4) {
    await lib.craft('stick', 4);
  }
  if (!lib.count('stone_pickaxe') && lib.count('cobblestone') >= 3) {
    await lib.craft('stone_pickaxe', 1);
  }
  if (lib.count('stone_sword') < 2 && lib.count('cobblestone') >= 4) {
    await lib.craft('stone_sword', 2);
  }
  await lib.equipWeapon();
  console.log('Tools crafted. Tools:', JSON.stringify(lib.tools()));
}

// 2. Sprint to Overworld Nether Portal
if (bot.game.dimension !== 'the_nether') {
  console.log('Sprinting to Nether portal at (299, 73, -54)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(299.5, 72.0, -52.5, 1));
  } catch (e) {
    console.log('Pathfinder near portal note:', e.message);
  }

  console.log('Stepping into Nether portal block at (299.5, 73.0, -54.0)...');
  await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
  bot.setControlState('jump', true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);

  console.log('Inside portal. Waiting for dimension shift to the_nether...');
  const start = Date.now();
  while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 15000)) {
    await sleep(500);
  }
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to enter the_nether. Current dim: ${bot.game.dimension}`);
}

console.log('Successfully entered the_nether! Alpha pos:', lib.fmt(bot.entity.position));
bot.chat(`alpha: In Nether with stone gear & cobble! Sprinting to z=-158 to recover gear and seal corridor!`);

// 3. Step out of portal block into Nether bunker
await bot.lookAt(new Vec3(40.5, 65.0, -5.0), true);
bot.setControlState('forward', true);
await sleep(600);
bot.setControlState('forward', false);

// 4. Sprint through enclosed East Ridge trail
const waypoints = [
  new Vec3(50, 65, -6),
  new Vec3(63, 65, -5),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -157)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  // keep pitch low to prevent Enderman gaze
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (e) {
    console.log(`WP note to ${lib.fmt(wp)}: ${e.message}`);
    await bot.lookAt(new Vec3(wp.x + 0.5, 64.0, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(400);
    bot.setControlState('forward', false);
  }
}

console.log('Arrived at fortress hallway:', lib.fmt(bot.entity.position));

// 5. Pick up dropped items nearby (Delta drop at z=-158.5)
const itemsBefore = bot.inventory.items().length;
const picked = await lib.pickup(6);
console.log(`Picked up drops: ${picked} items. Inv item count: ${bot.inventory.items().length}`);

// 6. Inspect corridor ahead and place blast wall at z=-160
console.log('Placing blast wall at (44, 65..66, -160)...');
try {
  const wallMat = lib.count('cobblestone') > 0 ? 'cobblestone' : (lib.count('dirt') > 0 ? 'dirt' : 'birch_planks');
  if (wallMat) {
    await lib.place(wallMat, 44, 65, -160);
    await lib.place(wallMat, 44, 66, -160);
    console.log(`Placed protective wall at (44, 65..66, -160) using ${wallMat}!`);
  }
} catch (err) {
  console.log('Wall placement note:', err.message);
}

// 7. Equip weapon & report
await lib.equipWeapon();
console.log('=== Final Status ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Inventory:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));
