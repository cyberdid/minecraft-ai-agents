// programs/564-rearm-and-nether-transit.js
console.log('=== Step: Harvest 1 Log, Craft Wooden Tools, and Transit to Nether ===');

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Dig ground birch log at (317, 70, -46)
console.log('Digging birch log at (317, 70, -46)...');
try {
  await lib.goTo(317, 70, -46, 2, { dig: false });
  await lib.dig(317, 70, -46);
  await lib.pickup(4);
} catch (e) {
  console.log('Dig note:', e.message);
  await lib.pickup(6);
}

console.log('Inventory before crafting:', JSON.stringify(lib.inv()));

// 2. Craft planks, wooden sword, wooden pickaxe
const logCount = lib.count('birch_log') + lib.count('*_log');
if (logCount > 0) {
  try {
    await lib.craft('birch_planks', logCount * 4);
  } catch (e) {
    console.log('Planks craft note:', e.message);
  }
}

try {
  await lib.craft('wooden_sword', 1);
  console.log('Crafted wooden_sword!');
} catch (e) {
  console.log('Wooden sword craft note:', e.message);
}

try {
  await lib.craft('wooden_pickaxe', 1);
  console.log('Crafted wooden_pickaxe!');
} catch (e) {
  console.log('Wooden pickaxe craft note:', e.message);
}

await lib.equipWeapon();
console.log('Inventory after craft:', JSON.stringify(lib.inv()));

// 3. Sprint to Nether Portal at (299.5, 73.0, -54.0)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Sprinting to Nether portal at (299.5, 73.0, -54.0)...');

try {
  await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
} catch (e) {
  try {
    await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false });
  } catch (e2) {
    await bot.lookAt(portalTarget, true);
    bot.setControlState('forward', true);
    await sleep(1500);
    bot.clearControlStates();
  }
}

console.log('Inside portal at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 4. Wait for Nether warp (80 ticks = 4.0s)
const startDim = bot.game.dimension;
for (let s = 0; s < 10; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  inv: lib.inv()
};
