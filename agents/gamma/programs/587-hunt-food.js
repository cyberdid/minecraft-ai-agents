// programs/587-hunt-food.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== HUNT FOOD FOR NETHER EXPEDITION ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'HP:', bot.health);

bot.chat('gamma: Scouting grassland to hunt cows/sheep for expedition food rations!');

// Search for animals
try {
  const killed = await lib.hunt('cow', 3);
  console.log('Cows killed:', killed);
} catch (e) {
  console.log('Hunt cow note:', e.message);
  try {
    const killedSheep = await lib.hunt('sheep', 3);
    console.log('Sheep killed:', killedSheep);
  } catch (e2) {
    console.log('Hunt sheep note:', e2.message);
  }
}

// Return to base
console.log('Returning to base...');
try {
  await lib.goTo(293, 72, -55, 1.5, { timeoutMs: 15000 });
} catch (e) {}

// Cook any raw meat in furnace
const raw = bot.inventory.items().filter(i => i.name.startsWith('raw_') && !i.name.includes('iron') && !i.name.includes('copper') && !i.name.includes('gold'));
console.log('Raw meat collected:', raw.map(i => `${i.name} x${i.count}`).join(', ') || 'none');

for (const m of raw) {
  try {
    await lib.smelt(m.name, 'coal', m.count);
  } catch (e) {
    console.log(`Smelt ${m.name} note:`, e.message);
  }
}

// Eat cooked food if hungry
for (const item of bot.inventory.items()) {
  if (['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken'].includes(item.name)) {
    if (bot.food < 20) {
      try {
        await bot.equip(item, 'hand');
        await bot.consume();
        console.log('Ate', item.name, 'Food now:', bot.food);
      } catch (e) {}
    }
  }
}

bot.chat(`gamma: Returned to base! Food: ${bot.food}/20, HP: ${bot.health.toFixed(1)}/20. Ready for Nether!`);

return {
  food: bot.food,
  hp: bot.health,
  inv: lib.inv(),
  pos: bot.entity.position
};
