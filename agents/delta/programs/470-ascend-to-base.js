// programs/470-ascend-to-base.js
console.log('Delta ascending from:', lib.fmt(bot.entity.position));

// Ascend back to base surface
try {
  await bot.pathfinder.goto(new goals.GoalNear(293, 72, -55, 1));
} catch (e) {
  try {
    await lib.goToXZ(293, -55);
  } catch (e2) {
    console.log('Navigation note:', e2.message);
  }
}

// Enter base through door if needed
if (bot.entity.position.distanceTo(new Vec3(293, 72, -55)) > 2) {
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {}
}

console.log('Now at base position:', lib.fmt(bot.entity.position));

// Inspect base chest
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems().map(i => `${i.name} x${i.count}`);
    console.log('Base Chest items:', items.join(', '));
    chest.close();
  } catch (e) {
    console.log('Chest note:', e.message);
  }
}

// Check nearby teammates
const players = Object.values(bot.players).filter(p => p.username !== bot.username && p.entity);
for (const p of players) {
  console.log(`Teammate ${p.username}: pos=${lib.fmt(p.entity.position)}`);
}

bot.chat('delta: At Base house (293, 72, -55)! Ready with team for Milestone 9 (Gold gathering & Ender Pearls)!');

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
