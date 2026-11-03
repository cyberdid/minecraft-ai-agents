console.log('=== Program 993: Craft Surplus Eyes, Clean Inv & March to Stronghold ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Time:', bot.time.timeOfDay);
console.log('Current Eyes:', lib.count('ender_eye'), 'Pearls:', lib.count('ender_pearl'), 'Powder:', lib.count('blaze_powder'));

// 1. Craft remaining pearls into ender_eye
while (lib.count('ender_pearl') > 0 && lib.count('blaze_powder') > 0 && !isCancelled()) {
  const c = Math.min(lib.count('ender_pearl'), lib.count('blaze_powder'), 8);
  if (c <= 0) break;
  try {
    await lib.craft('ender_eye', c);
  } catch (e) {
    console.log('Craft note:', e.message);
    break;
  }
}

console.log(`Total Eyes of Ender held: ${lib.count('ender_eye')}!`);
bot.chat(`Beta: 100% COMPLETE! Holding ${lib.count('ender_eye')} Eyes of Ender! Marching team to Stronghold (233, y, -98)!`);

// 2. Deposit clutter into Base Chest (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const junk = ['gold_nugget', 'stone_pickaxe', 'bone', 'crying_obsidian', 'blackstone', 'wooden_pickaxe', 'stone_sword', 'andesite', 'blaze_powder'];
    for (const j of junk) {
      const items = bot.inventory.items().filter(i => i.name === j);
      for (const it of items) {
        try {
          await chest.deposit(it.type, null, it.count);
        } catch (e) {}
      }
    }
    // Also withdraw cooked food if available
    const food = chest.containerItems().find(i => i.name.includes('cooked') || i.name === 'bread');
    if (food && lib.count(food.name) === 0) {
      await chest.withdraw(food.type, null, Math.min(food.count, 16));
    }
    chest.close();
  } catch (e) {}
}

// 3. Equip full gear
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// 4. Exit through base door at (294, 72, -54)
console.log('Exiting Base House through door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door passage error:', e.message);
}

// 5. March to Stronghold coordinates at (233, 70, -98)
const strongholdSurface = new Vec3(233.0, 70.0, -98.0);
console.log(`Marching from ${lib.fmt(bot.entity.position)} to Stronghold site ${lib.fmt(strongholdSurface)} (~75m)...`);

// Waypoints to navigate around terrain smoothly:
// Base door: (294, 72, -53) -> (280, 71, -65) -> (255, 70, -80) -> (233, 70, -98)
const waypoints = [
  new Vec3(280.0, 71.0, -65.0),
  new Vec3(255.0, 70.0, -80.0),
  strongholdSurface
];

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`Advancing to Waypoint ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
  } catch (err) {
    console.log(`Pathfinder to WP ${i + 1} info:`, err.message);
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 12000 });
    } catch (e2) {}
  }
  console.log(`Current position: ${lib.fmt(bot.entity.position)}`);
}

// Check distance to Stronghold
const distToStronghold = bot.entity.position.distanceTo(strongholdSurface);
console.log(`Distance to Stronghold surface (233, 70, -98): ${distToStronghold.toFixed(1)}m`);

return {
  eyes: lib.count('ender_eye'),
  pos: bot.entity.position,
  distToStronghold,
  inv: lib.inv(),
  hp: bot.health,
  food: bot.food
};
