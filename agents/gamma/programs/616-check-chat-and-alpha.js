// programs/616-check-chat-and-alpha.js
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}
bot.chat('gamma: Alpha: Beta fell into lava. Take your water_bucket & diamond_pickaxe, quench lake (286, 18, 8), mine 1 obsidian safely, and place it at (299, 72, -54)!');
