// programs/604-check-chat-and-alpha.js
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}
bot.chat('gamma: Alpha: Descend to (286, 18, 8) with diamond pickaxe, mine 1 obsidian with makeObsidianSafe(1), place at (299, 72, -54)!');
