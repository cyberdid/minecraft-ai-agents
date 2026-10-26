// programs/236-stabilize-position.js
console.log('Delta pos before:', lib.fmt(bot.entity.position), 'health:', bot.health, 'food:', bot.food);

bot.pathfinder.stop();

// Move carefully to center of (44, 65, -162)
const safeTarget = new Vec3(44.5, 65.0, -162.5);
await bot.lookAt(safeTarget, true);
await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -162));

console.log('Delta pos after move:', lib.fmt(bot.entity.position));

// Place guard blocks to prevent slipping off the west edge
const west1 = bot.blockAt(new Vec3(43, 64, -162));
if (!west1 || west1.name === 'air' || west1.name === 'cave_air') {
  try {
    await lib.place('cobblestone', 43, 64, -162);
    console.log('Placed safety floor at (43, 64, -162)');
  } catch (e) {
    console.log('Could not place (43, 64, -162):', e.message);
  }
}

const west2 = bot.blockAt(new Vec3(43, 64, -163));
if (!west2 || west2.name === 'air' || west2.name === 'cave_air') {
  try {
    await lib.place('cobblestone', 43, 64, -163);
    console.log('Placed safety floor at (43, 64, -163)');
  } catch (e) {
    console.log('Could not place (43, 64, -163):', e.message);
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position), 'cobble left:', lib.count('cobblestone'));
