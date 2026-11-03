// programs/696-check-chat-and-chest.js
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// Check Base Chest
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    console.log('Base Chest items:');
    for (const item of chest.containerItems()) {
      console.log(` - ${item.name} x ${item.count}`);
    }
    await chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// Check players
for (const name of ['beta', 'gamma', 'delta']) {
  const p = bot.players[name]?.entity;
  if (p) console.log(`Player ${name}: pos = ${lib.fmt(p.position)}, held = ${p.heldItem?.name}`);
}
