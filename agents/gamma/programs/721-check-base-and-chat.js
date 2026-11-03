// programs/721-check-base-and-chat.js
bot.chat('beta: Delta and I are at Base House (293, 72, -55) gearing up for Milestone 13 End Gateway & Elytra! Do you have spare Ender Pearls?');

console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// Check teammate locations
for (const [name, p] of Object.entries(bot.players)) {
  if (name === bot.username) continue;
  if (p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

// Check Base Chest items
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const pearls = chest.containerItems().find(i => i.name === 'ender_pearl');
    if (pearls) {
      console.log(`Found ${pearls.count} ender_pearls in Base Chest! Withdrawing...`);
      await chest.withdraw(pearls.type, null, Math.min(pearls.count, 4));
    }
    chest.close();
  } catch (e) {}
}

console.log('Inventory now:', lib.inv());
return { inv: lib.inv(), pos: bot.entity.position };
