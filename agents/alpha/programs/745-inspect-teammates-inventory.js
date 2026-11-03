// programs/745-inspect-teammates-inventory.js
console.log('=== Program 745: Inspect Teammates Inventories & Gear ===');

for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}: held=${p.entity.heldItem?.name}`);
  }
}

// Ask teammates in chat
bot.chat('alpha: Team: Nether portal at (299, 72, -54) is missing 1 obsidian at (299, 72, -54)! Does anyone hold an obsidian block or bucket?');

return {};
