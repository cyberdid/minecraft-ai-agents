// programs/820-diagnose-portal-and-chest.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 820: Diagnose Nether Portal & Base Supplies ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Walk to base room at (293, 72, -55)
console.log('Walking into base room at (293, 72, -55)...');
try {
  await lib.goTo(293, 72, -55, 1.5, { timeoutMs: 8000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(293, 72, -55, 1.2)); } catch (e2) {}
}

console.log('At base. Checking Base Chest (293, 72, -57)...');
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
let chestItems = [];
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    chestItems = chest.items().map(i => `${i.name}x${i.count}`);
    console.log('Base Chest items:', chestItems.join(', '));
    await chest.close();
  } catch (e) {
    console.log('Chest read error:', e.message);
  }
}

// Check furnace at (295, 72, -55)
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnaceBlock) {
  try {
    const f = await bot.openFurnace(furnaceBlock);
    console.log(`Furnace: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
    await f.close();
  } catch (e) {}
}

// Step to portal area at (298, 73, -54)
console.log('Inspecting Nether portal frame geometry at (298..301, 72..76, -54)...');
for (let y = 76; y >= 72; y--) {
  const row = [];
  for (let x = 298; x <= 301; x++) {
    const b = bot.blockAt(new Vec3(x, y, -54));
    row.push(`(${x},${y}):${b ? b.name : 'null'}`);
  }
  console.log(`y=${y}: ${row.join(' | ')}`);
}

// Check teammates
const teammates = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log('Teammates nearby:', teammates.map(t => `${t.username} at ${lib.fmt(t.position)}`).join(', '));

bot.chat('Beta: At base diagnosing Nether portal frame! I will help cast obsidian and reignite it!');

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inventory: lib.inv()
};
