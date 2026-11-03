// programs/505-check-team-and-pearls.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Inspect Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems();
    console.log('BASE CHEST:', items.map(i => `${i.name} x${i.count}`).join(', '));
    const pearls = items.find(i => i.name === 'ender_pearl');
    const ingots = items.find(i => i.name === 'gold_ingot');
    const nuggets = items.find(i => i.name === 'gold_nugget');
    console.log(`Team summary in chest: ender_pearls=${pearls?.count || 0}, gold_ingots=${ingots?.count || 0}, gold_nuggets=${nuggets?.count || 0}`);
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// 2. Check all players
const players = Object.values(bot.players).filter(p => p.username !== bot.username && p.entity);
for (const p of players) {
  console.log(`Player ${p.username}: dim=${p.entity.dimension || bot.game.dimension} pos=${lib.fmt(p.entity.position)}`);
}

bot.chat('delta: Status check: Base Chest checked. Coordinated for Milestone 9 (12+ Ender Pearls)!');

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
