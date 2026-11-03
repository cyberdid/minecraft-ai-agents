// programs/467-inspect-team-and-chest.js
console.log("Delta at base:", lib.fmt(bot.entity.position));

const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems().map(i => `${i.name} x${i.count}`);
    console.log("BASE CHEST CONTENTS:", items.join(', '));
    chest.close();
  } catch (e) {
    console.log("Chest error:", e.message);
  }
}

const players = Object.values(bot.players).filter(p => p.username !== bot.username && p.entity);
for (const p of players) {
  console.log(`Player ${p.username}: dim=${p.entity.dimension || bot.game.dimension} pos=${lib.fmt(p.entity.position)}`);
}

bot.chat("delta: Base Chest and team checked! Milestone 8 is 100% COMPLETE! Advancing to Milestone 9: 12+ Ender Pearls!");

return { pos: bot.entity.position, hp: bot.health, food: bot.food, inv: lib.inv() };
