// programs/611-check-alpha-obsidian.js
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}
bot.chat('gamma: Alpha: Do you hold an obsidian block in inventory to place at (299, 72, -54)?');
