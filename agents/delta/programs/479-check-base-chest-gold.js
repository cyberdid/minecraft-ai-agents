// programs/479-check-base-chest-gold.js
console.log('Delta checking Base Chest at:', lib.fmt(bot.entity.position));

// Enter base if outside
if (bot.entity.position.z > -54.0) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
}

const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems();
    console.log('Base Chest items:', items.map(i => `${i.name} x${i.count}`).join(', '));

    const ingots = items.find(i => i.name === 'gold_ingot');
    const nuggets = items.find(i => i.name === 'gold_nugget');
    const boots = items.find(i => i.name === 'golden_boots');
    const pearls = items.find(i => i.name === 'ender_pearl');
    console.log(`Team Gold & Pearls: ingots=${ingots?.count || 0}, nuggets=${nuggets?.count || 0}, golden_boots=${boots?.count || 0}, ender_pearls=${pearls?.count || 0}`);

    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

const players = Object.values(bot.players).filter(p => p.username !== bot.username && p.entity);
for (const p of players) {
  console.log(`Teammate ${p.username}: pos=${lib.fmt(p.entity.position)}`);
}

bot.chat('delta: Checking team inventory and gold reserves for Milestone 9 (12+ Ender Pearls)...');

return { pos: bot.entity.position, hp: bot.health, food: bot.food };
